"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getShipments, updateShipmentStatus, getShipmentTracking } from "@/services/ShipmentLogistics";

const STATUSES = ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED", "FAILED"];
const TABS     = ["All", "CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED", "FAILED"];

const STATUS_COLORS = {
  CREATED:           "bg-blue-500/20 text-blue-300 border-blue-500/30",
  PICKED_UP:         "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  IN_TRANSIT:        "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  OUT_FOR_DELIVERY:  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  DELIVERED:         "bg-green-500/20 text-green-300 border-green-500/30",
  RETURNED:          "bg-purple-500/20 text-purple-300 border-purple-500/30",
  FAILED:            "bg-red-500/20 text-red-300 border-red-500/30",
};

/** Valid next statuses for each current status */
const TRANSITIONS = {
  CREATED:          ["PICKED_UP", "FAILED"],
  PICKED_UP:        ["IN_TRANSIT", "FAILED"],
  IN_TRANSIT:       ["OUT_FOR_DELIVERY", "RETURNED", "FAILED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "RETURNED", "FAILED"],
  DELIVERED:        [],
  RETURNED:         [],
  FAILED:           [],
};

const STEP_ICONS = {
  CREATED:          "📦",
  PICKED_UP:        "🚛",
  IN_TRANSIT:       "🌐",
  OUT_FOR_DELIVERY: "🏠",
  DELIVERED:        "✅",
  RETURNED:         "↩️",
  FAILED:           "❌",
};

const fmtAddress = (addr) => {
  if (!addr) return "—";
  if (typeof addr === "string") return addr;
  return [addr.city, addr.country].filter(Boolean).join(", ") || addr.line1 || "—";
};

const Toast = ({ msg }) =>
  msg ? (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl text-sm flex items-center gap-2 ${
      msg.type === "success" ? "bg-green-900/90 border-green-500/40 text-green-300" : "bg-red-900/90 border-red-500/40 text-red-300"
    }`}>{msg.text}</div>
  ) : null;

export default function ShipmentsList() {
  const router = useRouter();

  const [shipments, setShipments]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [msg, setMsg]                       = useState(null);
  const [activeTab, setActiveTab]           = useState("All");
  const [searchTerm, setSearch]             = useState("");
  const [actionLoading, setActionLoading]   = useState(false);

  // Timeline modal
  const [trackingModal, setTrackingModal]       = useState(null);
  const [trackingEvents, setTrackingEvents]     = useState([]);
  const [trackingLoading, setTrackingLoading]   = useState(false);

  // Status update modal
  const [statusModal, setStatusModal] = useState(null); // { shipment, nextStatus }
  const [statusNote, setStatusNote]   = useState("");
  const [statusLoc, setStatusLoc]     = useState("");

  useEffect(() => { fetchShipments(); }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await getShipments();
      setShipments(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch { setError("Failed to load shipments"); }
    finally { setLoading(false); }
  };

  const openTracking = async (shipment) => {
    setTrackingModal(shipment);
    setTrackingLoading(true);
    try {
      const res = await getShipmentTracking(shipment.id);
      setTrackingEvents(Array.isArray(res) ? res : res?.data || []);
    } catch { setTrackingEvents([]); }
    finally { setTrackingLoading(false); }
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    setActionLoading(true);
    try {
      await updateShipmentStatus(statusModal.shipment.id, {
        status:   statusModal.nextStatus,
        location: statusLoc,
        notes:    statusNote,
      });
      setMsg({ type: "success", text: `Status updated to ${statusModal.nextStatus}` });
      setStatusModal(null);
      setStatusNote("");
      setStatusLoc("");
      await fetchShipments();
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Status update failed" });
    } finally { setActionLoading(false); }
  };

  const filtered = shipments.filter((s) => {
    const matchTab    = activeTab === "All" || s.status === activeTab;
    const matchSearch = !searchTerm ||
      (s.shipmentNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.trackingNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      fmtAddress(s.destinationAddress).toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total:     shipments.length,
    inTransit: shipments.filter((s) => ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(s.status)).length,
    delivered: shipments.filter((s) => s.status === "DELIVERED").length,
    failed:    shipments.filter((s) => s.status === "FAILED").length,
    returned:  shipments.filter((s) => s.status === "RETURNED").length,
  };

  const isOverdue = (s) => {
    if (!s.estimatedDeliveryDate || s.status === "DELIVERED") return false;
    return new Date(s.estimatedDeliveryDate) < new Date();
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <Toast msg={msg} />

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Shipments & Logistics</h1>
            <p className="text-gray-400">Track global shipments with real-time status updates</p>
          </div>
          <button onClick={() => router.push("/Shipments/Add")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Shipment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total",      value: stats.total,     color: "text-white" },
            { label: "In Transit", value: stats.inTransit, color: "text-yellow-400" },
            { label: "Delivered",  value: stats.delivered, color: "text-green-400" },
            { label: "Returned",   value: stats.returned,  color: "text-purple-400" },
            { label: "Failed",     value: stats.failed,    color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex bg-gray-900/60 border border-gray-800/60 rounded-lg overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}>
                {STEP_ICONS[tab] ? `${STEP_ICONS[tab]} ` : ""}{tab}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search by shipment #, tracking #, destination..."
            value={searchTerm} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] max-w-sm px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500" />
        </div>

        {error && <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["Shipment #", "Direction", "Destination", "Carrier", "Status", "ETA", "Delivered", "Items", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ship) => {
                    const overdue     = isOverdue(ship);
                    const transitions = TRANSITIONS[ship.status] || [];
                    return (
                      <tr key={ship.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${overdue ? "bg-red-900/5" : ""}`}>
                        <td className="px-5 py-4">
                          <p className="text-cyan-400 font-mono text-sm font-medium">{ship.shipmentNumber}</p>
                          {ship.trackingNumber && (
                            <p className="text-gray-600 text-xs mt-0.5 font-mono">{ship.trackingNumber}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                            ship.direction === "OUTBOUND" ? "bg-cyan-900/30 text-cyan-300 border-cyan-700/30" :
                            ship.direction === "INBOUND"  ? "bg-green-900/30 text-green-300 border-green-700/30" :
                                                            "bg-purple-900/30 text-purple-300 border-purple-700/30"
                          }`}>{ship.direction}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs max-w-[140px] truncate">
                          {fmtAddress(ship.destinationAddress)}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-sm">{ship.carrier?.name || "—"}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[ship.status]}`}>
                            {STEP_ICONS[ship.status]} {ship.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className={`px-5 py-4 text-sm whitespace-nowrap ${overdue ? "text-red-400 font-medium" : "text-gray-400"}`}>
                          {ship.estimatedDeliveryDate
                            ? new Date(ship.estimatedDeliveryDate).toLocaleDateString()
                            : "—"}
                          {overdue && <span className="ml-1 text-[10px] text-red-500 uppercase font-bold">overdue</span>}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-sm">
                          {ship.actualDeliveryDate
                            ? new Date(ship.actualDeliveryDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-sm font-mono">
                          {ship.items?.length ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 flex-wrap min-w-[160px]">
                            <button onClick={() => openTracking(ship)}
                              className="text-cyan-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50">Timeline</button>
                            {transitions.slice(0, 2).map((next) => (
                              <button key={next}
                                onClick={() => setStatusModal({ shipment: ship, nextStatus: next })}
                                className={`text-[11px] px-2 py-0.5 rounded bg-gray-800/50 ${
                                  next === "DELIVERED" ? "text-green-400" :
                                  next === "FAILED"    ? "text-red-400" :
                                  next === "RETURNED"  ? "text-purple-400" :
                                                         "text-yellow-400"
                                }`}>
                                → {next.replace(/_/g, " ")}
                              </button>
                            ))}
                            <button onClick={() => router.push(`/Shipments/Edit/${ship.id}`)}
                              className="text-gray-400 hover:text-white text-[11px] px-2 py-0.5 rounded bg-gray-800/50">Edit</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-gray-500 py-14">No shipments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Timeline Modal ── */}
        {trackingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-white font-bold text-lg">Shipment Timeline</h3>
                  <p className="text-cyan-400 font-mono text-sm">{trackingModal.shipmentNumber}</p>
                </div>
                <button onClick={() => setTrackingModal(null)} className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Lifecycle bar */}
              <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                {["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].map((step, i, arr) => {
                  const reached = STATUSES.indexOf(trackingModal.status) >= STATUSES.indexOf(step);
                  return (
                    <div key={step} className="flex items-center gap-1 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${
                        reached ? "bg-cyan-600 border-cyan-500 text-white" : "bg-gray-800 border-gray-700 text-gray-600"
                      }`}>
                        {STEP_ICONS[step]}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-8 h-0.5 ${reached ? "bg-cyan-600" : "bg-gray-700"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {trackingLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : trackingEvents.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No tracking events yet</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-700" />
                  <div className="space-y-5">
                    {trackingEvents.map((ev, i) => (
                      <div key={ev.id || i} className="relative flex gap-4 pl-8">
                        <div className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center text-xs border shrink-0 ${
                          STATUS_COLORS[ev.status] || "bg-gray-800 border-gray-700"
                        }`}>
                          {STEP_ICONS[ev.status] || "•"}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{ev.status?.replace(/_/g, " ")}</p>
                          {ev.location && <p className="text-gray-400 text-xs mt-0.5">{ev.location}</p>}
                          {ev.notes && <p className="text-gray-500 text-xs mt-1 italic">{ev.notes}</p>}
                          <p className="text-gray-600 text-xs mt-1">
                            {ev.occurredAt ? new Date(ev.occurredAt).toLocaleString() : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Status Update Modal ── */}
        {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-white font-bold text-lg mb-1">Update Shipment Status</h3>
              <p className="text-gray-400 text-sm mb-5">
                <span className="text-cyan-400 font-mono">{statusModal.shipment.shipmentNumber}</span>
                {" → "}
                <span className={`text-xs px-2 py-0.5 rounded-full border ml-1 ${STATUS_COLORS[statusModal.nextStatus]}`}>
                  {statusModal.nextStatus.replace(/_/g, " ")}
                </span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Current Location</label>
                  <input type="text" value={statusLoc} onChange={(e) => setStatusLoc(e.target.value)}
                    placeholder="e.g. Dubai Distribution Center"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Notes</label>
                  <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={2}
                    placeholder="Update notes or reason..."
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-5">
                <button onClick={() => { setStatusModal(null); setStatusNote(""); setStatusLoc(""); }}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleStatusChange} disabled={actionLoading}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {actionLoading ? "Updating..." : "Confirm Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
