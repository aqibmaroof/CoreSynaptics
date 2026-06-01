"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getAssets,
  changeAssetStatus,
  assignAsset,
  getAssetHistory,
} from "@/services/AssetManagement";
import { getUsers } from "@/services/Users";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

// ── Domain constants ────────────────────────────────────────────────────────

const TRANSITIONS = {
  IN_STOCK: ["ASSIGNED", "IN_REPAIR", "RETIRED"],
  ASSIGNED: ["IN_STOCK", "IN_REPAIR", "DAMAGED", "LOST"],
  IN_REPAIR: ["IN_STOCK", "DAMAGED", "RETIRED"],
  DAMAGED: ["IN_REPAIR", "RETIRED", "LOST"],
  RETIRED: [],
  LOST: ["IN_STOCK"],
};

// ── UI mapping ──────────────────────────────────────────────────────────────

const STAGE_LABEL = {
  IN_STOCK: "In Stock",
  ASSIGNED: "Installed",
  IN_REPAIR: "In Repair",
  DAMAGED: "Damaged",
  RETIRED: "Commissioned",
  LOST: "Lost",
};

// Stage pill (background tint + text color)
const STAGE_PILL = {
  IN_STOCK: {
    bg: "color-mix(in srgb, var(--rf-green) 16%, transparent)",
    fg: "var(--rf-green2)",
  },
  ASSIGNED: {
    bg: "color-mix(in srgb, var(--rf-yellow) 22%, transparent)",
    fg: "var(--rf-yellow2)",
  },
  IN_REPAIR: {
    bg: "color-mix(in srgb, var(--rf-orange) 18%, transparent)",
    fg: "var(--rf-orange)",
  },
  DAMAGED: {
    bg: "color-mix(in srgb, var(--rf-orange) 22%, transparent)",
    fg: "var(--rf-orange)",
  },
  RETIRED: {
    bg: "color-mix(in srgb, var(--rf-green) 18%, transparent)",
    fg: "var(--rf-green2)",
  },
  LOST: {
    bg: "color-mix(in srgb, var(--rf-red) 14%, transparent)",
    fg: "var(--rf-red2)",
  },
};

// Lifecycle progression: how many segments are "filled" by status.
const LIFECYCLE_STAGES = ["L2", "L3", "L4", "IST"];
const STATUS_PROGRESS = {
  IN_STOCK: 1, // L2
  ASSIGNED: 2, // L2, L3
  IN_REPAIR: 2,
  DAMAGED: 2,
  RETIRED: 4, // all
  LOST: 4,
};

const STAGE_COLOR_AT = (i, status) => {
  // L2/L3 → accent, L4 → orange, IST → orange (or muted if not reached)
  if (status === "RETIRED") return "var(--rf-green)";
  if (i <= 1) return "var(--rf-accent)";
  return "var(--rf-orange)";
};

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

// ── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ msg }) =>
  msg ? (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 200,
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 13,
        background:
          msg.type === "success"
            ? "color-mix(in srgb, var(--rf-green) 16%, var(--rf-bg2))"
            : "color-mix(in srgb, var(--rf-red) 16%, var(--rf-bg2))",
        color: msg.type === "success" ? "var(--rf-green2)" : "var(--rf-red2)",
        border: `1px solid ${
          msg.type === "success" ? "var(--rf-green)" : "var(--rf-red)"
        }`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      {msg.text}
    </div>
  ) : null;

// ── Main ────────────────────────────────────────────────────────────────────

export default function AssetsList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete } = useUserPermissions();

  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [statusModal, setStatusModal] = useState(null);
  const [statusReason, setStatusReason] = useState("");

  const [assignModal, setAssignModal] = useState(null);
  const [assignUserId, setAssignUserId] = useState("");

  const [historyModal, setHistoryModal] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchUsers();
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getAssets();
      setAssets(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch {
      setError("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res) ? res : res?.data || []);
    } catch {
      // non-critical
    }
  };

  const withAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      setMsg({ type: "success", text: successMsg });
      await fetchAssets();
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    await withAction(
      () =>
        changeAssetStatus(statusModal.asset.id, {
          status: statusModal.nextStatus,
          reason: statusReason,
        }),
      `Asset status changed to ${statusModal.nextStatus}`,
    );
    setStatusModal(null);
    setStatusReason("");
  };

  const handleAssign = async () => {
    if (!assignModal || !assignUserId) return;
    await withAction(
      () => assignAsset(assignModal.id, { assignedToUserId: assignUserId }),
      "Asset assigned successfully",
    );
    setAssignModal(null);
    setAssignUserId("");
  };

  const openHistory = async (asset) => {
    setHistoryModal(asset);
    setHistoryLoading(true);
    try {
      const res = await getAssetHistory(asset.id);
      setHistoryEvents(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setHistoryEvents([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const isWarrantyExpiring = (a) => {
    if (!a.warrantyExpiry) return false;
    const diff =
      (new Date(a.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };
  const isWarrantyExpired = (a) =>
    a.warrantyExpiry && new Date(a.warrantyExpiry) < new Date();

  // Distinct OEM count (best-effort, since asset domain has no manufacturer field)
  const oemCount = useMemo(() => {
    const set = new Set();
    assets.forEach((a) => {
      const v = a.manufacturer || a.supplier || a.category;
      if (v) set.add(v);
    });
    return set.size;
  }, [assets]);

  return (
    <div style={{ padding: 24, margin: "0 auto" }}>
      <Toast msg={msg} />

      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--rf-txt)",
              margin: 0,
            }}
          >
            Equipment
          </h1>
          <p
            style={{
              color: "var(--rf-txt3)",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {assets.length} unit{assets.length === 1 ? "" : "s"} across{" "}
            {oemCount || "all"} OEM{oemCount === 1 ? "" : "s"}.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => router.push("/Assets/Add")}
          {...permissionProps(canCreate(MODULE.FIELD_EXECUTION), "create an asset")}
        >
          + Create asset
        </button>
      </header>

      {error && (
        <div
          style={{
            padding: 10,
            background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
            color: "var(--rf-red2)",
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rf-bg3)",
                  borderBottom: "1px solid var(--rf-border)",
                }}
              >
                {[
                  "UNIT ID",
                  "NAME",
                  "STAGE",
                  "LIFECYCLE",
                  "OEM",
                  "PIGTAIL",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      color: "var(--rf-txt3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: "var(--rf-txt3)",
                    }}
                  >
                    Loading…
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: "var(--rf-txt3)",
                    }}
                  >
                    No assets found
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    users={users}
                    router={router}
                    onHistory={() => openHistory(asset)}
                    onStatus={(next) => {
                      setStatusModal({ asset, nextStatus: next });
                      setStatusReason("");
                    }}
                    onAssign={() => {
                      setAssignModal(asset);
                      setAssignUserId("");
                    }}
                    expiring={isWarrantyExpiring(asset)}
                    expired={isWarrantyExpired(asset)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {statusModal && (
        <Modal onClose={() => setStatusModal(null)}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--rf-txt)",
              margin: 0,
            }}
          >
            Change asset status
          </h3>
          <p
            style={{
              color: "var(--rf-txt3)",
              fontSize: 13,
              margin: "4px 0 14px",
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                color: "var(--rf-accent)",
                fontWeight: 700,
              }}
            >
              {statusModal.asset.assetTag}
            </span>{" "}
            <span style={{ color: "var(--rf-txt3)" }}>→</span>{" "}
            <StagePill status={statusModal.nextStatus} />
          </p>
          <Field label="Reason / Notes">
            <textarea
              className="rf-input"
              rows={3}
              placeholder="Reason for this status change…"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            <button className="rf-btn" onClick={() => setStatusModal(null)}>
              Cancel
            </button>
            <button
              className="rf-btn rf-btn-primary"
              onClick={handleStatusChange}
              disabled={actionLoading}
            >
              {actionLoading ? "Updating…" : "Confirm"}
            </button>
          </div>
        </Modal>
      )}

      {assignModal && (
        <Modal onClose={() => setAssignModal(null)}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--rf-txt)",
              margin: 0,
            }}
          >
            Assign asset
          </h3>
          <p
            style={{
              color: "var(--rf-txt3)",
              fontSize: 13,
              margin: "4px 0 14px",
              fontFamily: MONO,
            }}
          >
            {assignModal.assetTag} — {assignModal.name}
          </p>
          <Field label="Assign to user *">
            <select
              className="rf-input"
              value={assignUserId}
              onChange={(e) => setAssignUserId(e.target.value)}
            >
              <option value="">Select user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            <button className="rf-btn" onClick={() => setAssignModal(null)}>
              Cancel
            </button>
            <button
              className="rf-btn rf-btn-primary"
              onClick={handleAssign}
              disabled={actionLoading || !assignUserId}
            >
              {actionLoading ? "Assigning…" : "Assign"}
            </button>
          </div>
        </Modal>
      )}

      {historyModal && (
        <Modal onClose={() => setHistoryModal(null)} wide>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 14,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--rf-txt)",
                  margin: 0,
                }}
              >
                Status history
              </h3>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: "var(--rf-accent)",
                  margin: "4px 0 0",
                }}
              >
                {historyModal.assetTag} — {historyModal.name}
              </p>
            </div>
            <button
              className="rf-btn"
              onClick={() => setHistoryModal(null)}
              aria-label="Close"
              style={{ padding: "4px 10px" }}
            >
              ✕
            </button>
          </div>
          {historyLoading ? (
            <div
              style={{
                color: "var(--rf-txt3)",
                textAlign: "center",
                padding: 30,
              }}
            >
              Loading…
            </div>
          ) : historyEvents.length === 0 ? (
            <div
              style={{
                color: "var(--rf-txt3)",
                textAlign: "center",
                padding: 24,
              }}
            >
              No history recorded yet
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: "var(--rf-border)",
                }}
              />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {historyEvents.map((ev, i) => {
                  const changer = users.find((u) => u.id === ev.changedBy);
                  return (
                    <div
                      key={ev.id || i}
                      style={{ position: "relative", paddingLeft: 32 }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "var(--rf-bg2)",
                          border: "2px solid var(--rf-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          color: "var(--rf-txt3)",
                        }}
                      >
                        •
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        {ev.previousStatus && (
                          <StagePill status={ev.previousStatus} small />
                        )}
                        <span style={{ color: "var(--rf-txt3)", fontSize: 11 }}>
                          →
                        </span>
                        <StagePill status={ev.newStatus} small />
                      </div>
                      {ev.reason && (
                        <p
                          style={{
                            color: "var(--rf-txt2)",
                            fontSize: 12,
                            margin: "4px 0 0",
                          }}
                        >
                          {ev.reason}
                        </p>
                      )}
                      <p
                        style={{
                          color: "var(--rf-txt3)",
                          fontSize: 11,
                          margin: "2px 0 0",
                          fontFamily: MONO,
                        }}
                      >
                        {changer
                          ? `${changer.firstName} ${changer.lastName}`
                          : "System"}{" "}
                        ·{" "}
                        {ev.timestamp
                          ? new Date(ev.timestamp).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────

function AssetRow({
  asset,
  users,
  router,
  onHistory,
  onStatus,
  onAssign,
  expiring,
  expired,
}) {
  const [hovered, setHovered] = useState(false);
  const transitions = TRANSITIONS[asset.status] || [];
  const assignedUser = users.find((u) => u.id === asset.currentAssignedUserId);
  const oem = asset.manufacturer || asset.supplier || asset.category || "—";

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/Assets/Edit/${asset.id}`)}
      style={{
        borderBottom: "1px solid var(--rf-border)",
        background: hovered
          ? "color-mix(in srgb, var(--rf-accent) 4%, transparent)"
          : expired
          ? "color-mix(in srgb, var(--rf-red) 4%, transparent)"
          : "transparent",
        cursor: "pointer",
      }}
    >
      <td
        style={{
          padding: "14px 16px",
          verticalAlign: "top",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--rf-txt)",
          }}
        >
          {asset.assetTag || "—"}
        </div>
        {asset.category && (
          <div
            style={{
              display: "inline-block",
              marginTop: 4,
              padding: "2px 6px",
              background: "var(--rf-bg3)",
              borderRadius: 4,
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              letterSpacing: "0.05em",
            }}
          >
            {String(asset.category).toUpperCase().slice(0, 8)}
          </div>
        )}
      </td>

      <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
        <div style={{ fontWeight: 600, color: "var(--rf-txt)" }}>
          {asset.name || "—"}
        </div>
        <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 2 }}>
          {asset.location?.name ||
            (assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName}`
              : "—")}
        </div>
      </td>

      <td
        style={{
          padding: "14px 16px",
          verticalAlign: "top",
          whiteSpace: "nowrap",
        }}
      >
        <StagePill status={asset.status} />
      </td>

      <td
        style={{
          padding: "14px 16px",
          verticalAlign: "top",
          whiteSpace: "nowrap",
        }}
      >
        <LifecycleBar status={asset.status} />
      </td>

      <td
        style={{
          padding: "14px 16px",
          verticalAlign: "top",
          color: "var(--rf-txt2)",
        }}
      >
        {oem}
      </td>

      <td
        style={{
          padding: "14px 16px",
          verticalAlign: "top",
          whiteSpace: "nowrap",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <PigtailPill
            expired={expired}
            expiring={expiring}
            hasWarranty={!!asset.warrantyExpiry}
          />
          <RowKebab
            visible={hovered}
            asset={asset}
            transitions={transitions}
            onHistory={onHistory}
            onAssign={onAssign}
            onStatus={onStatus}
            onEdit={() => router.push(`/Assets/Edit/${asset.id}`)}
          />
        </div>
      </td>
    </tr>
  );
}

function RowKebab({
  visible,
  asset,
  transitions,
  onHistory,
  onAssign,
  onStatus,
  onEdit,
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{
        position: "relative",
        opacity: visible || open ? 1 : 0,
        transition: "opacity 120ms",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Row actions"
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          background: "var(--rf-bg3)",
          border: "1px solid var(--rf-border)",
          color: "var(--rf-txt2)",
          cursor: "pointer",
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
        }}
      >
        ⋮
      </button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 30 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              right: 0,
              zIndex: 31,
              minWidth: 180,
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border)",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              padding: 4,
            }}
          >
            <KebabItem
              onClick={() => {
                setOpen(false);
                onHistory();
              }}
            >
              View history
            </KebabItem>
            {asset.status === "IN_STOCK" && (
              <KebabItem
                accent
                onClick={() => {
                  setOpen(false);
                  onAssign();
                }}
              >
                Assign
              </KebabItem>
            )}
            <KebabItem
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            >
              Edit
            </KebabItem>
            {transitions.length > 0 && (
              <>
                <div
                  style={{
                    height: 1,
                    background: "var(--rf-border)",
                    margin: "4px 0",
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--rf-txt3)",
                    letterSpacing: "0.05em",
                    padding: "4px 10px",
                  }}
                >
                  CHANGE STAGE
                </div>
                {transitions.map((next) => (
                  <KebabItem
                    key={next}
                    onClick={() => {
                      setOpen(false);
                      onStatus(next);
                    }}
                  >
                    → {STAGE_LABEL[next] || next.replace(/_/g, " ")}
                  </KebabItem>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </span>
  );
}

function KebabItem({ onClick, accent, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "6px 10px",
        background: "transparent",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 12,
        color: accent ? "var(--rf-accent)" : "var(--rf-txt2)",
      }}
    >
      {children}
    </button>
  );
}

// ── Cell-level helpers ──────────────────────────────────────────────────────

function StagePill({ status, small }) {
  const pill = STAGE_PILL[status] || {
    bg: "var(--rf-bg3)",
    fg: "var(--rf-txt3)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: small ? "2px 8px" : "4px 12px",
        borderRadius: 4,
        fontSize: small ? 10 : 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        background: pill.bg,
        color: pill.fg,
        fontFamily: MONO,
      }}
    >
      {STAGE_LABEL[status] || status}
    </span>
  );
}

function LifecycleBar({ status }) {
  const filled = STATUS_PROGRESS[status] ?? 0;
  return (
    <div style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {LIFECYCLE_STAGES.map((label, i) => {
        const isFilled = i < filled;
        const color = STAGE_COLOR_AT(i, status);
        return (
          <span
            key={label}
            style={{
              minWidth: 28,
              textAlign: "center",
              padding: "3px 6px",
              borderRadius: 4,
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              background: isFilled ? color : "var(--rf-bg3)",
              color: isFilled ? "#fff" : "var(--rf-txt3)",
              border: isFilled
                ? "1px solid transparent"
                : "1px solid var(--rf-border)",
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

function PigtailPill({ expired, expiring, hasWarranty }) {
  if (expired) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          borderRadius: 4,
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          background: "color-mix(in srgb, var(--rf-red) 14%, transparent)",
          color: "var(--rf-red2)",
        }}
      >
        ⚠ EXPIRED
      </span>
    );
  }
  if (expiring) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          borderRadius: 4,
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          background: "color-mix(in srgb, var(--rf-yellow) 22%, transparent)",
          color: "var(--rf-yellow2)",
        }}
      >
        ⚠ PENDING
      </span>
    );
  }
  if (hasWarranty) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          borderRadius: 4,
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          background: "color-mix(in srgb, var(--rf-green) 16%, transparent)",
          color: "var(--rf-green2)",
        }}
      >
        ✓ STAGED
      </span>
    );
  }
  return <span style={{ color: "var(--rf-txt3)" }}>—</span>;
}

// ── Modal primitives ────────────────────────────────────────────────────────

function Modal({ children, onClose, wide }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="rf-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 20,
          maxWidth: wide ? 640 : 480,
          width: "100%",
          maxHeight: "92vh",
          overflow: "auto",
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 12,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--rf-txt3)",
          marginBottom: 4,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

