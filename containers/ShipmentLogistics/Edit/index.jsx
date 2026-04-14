"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getShipmentById, updateShipment, getCarriers } from "@/services/ShipmentLogistics";

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-red-400 ml-1">*</span>}
  </label>
);

const STATUS_BADGE = {
  CREATED:          "bg-blue-900/30 text-blue-300 border-blue-500/30",
  PICKED_UP:        "bg-cyan-900/30 text-cyan-300 border-cyan-500/30",
  IN_TRANSIT:       "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
  OUT_FOR_DELIVERY: "bg-orange-900/30 text-orange-300 border-orange-500/30",
  DELIVERED:        "bg-green-900/30 text-green-300 border-green-500/30",
  RETURNED:         "bg-purple-900/30 text-purple-300 border-purple-500/30",
  FAILED:           "bg-red-900/30 text-red-300 border-red-500/30",
};

const TERMINAL = ["DELIVERED", "RETURNED", "FAILED"];

export default function ShipmentEdit({ editId }) {
  const router = useRouter();

  const [carriers, setCarriers]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [fetching, setFetching]         = useState(true);
  const [fetchError, setFetchError]     = useState(null);
  const [msg, setMsg]                   = useState(null);
  const [errors, setErrors]             = useState({});
  const [shipmentStatus, setShipmentStatus]   = useState(null);
  const [shipmentNumber, setShipmentNumber]   = useState(null);
  const [shipmentDirection, setShipmentDirection] = useState(null);
  const [readOnlyItems, setReadOnlyItems]     = useState([]);

  // Only fields the API allows updating via PATCH
  const [form, setForm] = useState({
    carrierId:             "",
    trackingNumber:        "",
    estimatedDeliveryDate: "",
    notes:                 "",
  });
  const [destinationAddress, setDestinationAddress] = useState({
    line1: "", city: "", country: "", postalCode: "", contactName: "", contactPhone: "",
  });

  useEffect(() => {
    getCarriers().then((r) => setCarriers(Array.isArray(r) ? r : r?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    getShipmentById(editId)
      .then((res) => {
        const d = res?.data ?? res;
        setShipmentStatus(d.status);
        setShipmentNumber(d.shipmentNumber);
        setShipmentDirection(d.direction);
        setReadOnlyItems(Array.isArray(d.items) ? d.items : []);

        setForm({
          carrierId:             d.carrierId             ?? "",
          trackingNumber:        d.trackingNumber        ?? "",
          estimatedDeliveryDate: d.estimatedDeliveryDate
            ? d.estimatedDeliveryDate.split("T")[0]
            : "",
          notes: d.notes ?? "",
        });

        if (d.destinationAddress && typeof d.destinationAddress === "object") {
          setDestinationAddress({
            line1:        d.destinationAddress.line1        ?? "",
            city:         d.destinationAddress.city         ?? "",
            country:      d.destinationAddress.country      ?? "",
            postalCode:   d.destinationAddress.postalCode   ?? "",
            contactName:  d.destinationAddress.contactName  ?? "",
            contactPhone: d.destinationAddress.contactPhone ?? "",
          });
        }
      })
      .catch(() => setFetchError("Failed to load shipment. It may have been deleted."))
      .finally(() => setFetching(false));
  }, [editId]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const setAddr = (k) => (e) =>
    setDestinationAddress((p) => ({ ...p, [k]: e.target.value }));

  const isTerminal = TERMINAL.includes(shipmentStatus);
  const isOutbound = shipmentDirection === "OUTBOUND";

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const payload = {
        carrierId:      form.carrierId      || undefined,
        trackingNumber: form.trackingNumber || undefined,
        estimatedDeliveryDate: form.estimatedDeliveryDate
          ? new Date(form.estimatedDeliveryDate).toISOString()
          : undefined,
        notes: form.notes || undefined,
      };
      if (isOutbound) {
        payload.destinationAddress = destinationAddress;
      }
      await updateShipment(editId, payload);
      setMsg({ type: "success", text: "Shipment updated successfully" });
      setTimeout(() => router.push("/Shipments/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to update shipment" });
    } finally { setLoading(false); }
  };

  if (fetching) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading shipment...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{fetchError}</p>
          <button onClick={() => router.back()} className="text-cyan-400 hover:text-cyan-300 text-sm underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {msg && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
            msg.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>{msg.text}</div>
        )}

        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shipments
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Edit Shipment</h1>
            {shipmentNumber && <p className="text-gray-400 font-mono text-sm">{shipmentNumber}</p>}
          </div>
          <div className="flex items-center gap-3">
            {shipmentDirection && (
              <span className={`px-3 py-1 rounded border text-xs font-medium ${
                shipmentDirection === "OUTBOUND" ? "bg-cyan-900/30 text-cyan-300 border-cyan-700/30" :
                shipmentDirection === "INBOUND"  ? "bg-green-900/30 text-green-300 border-green-700/30" :
                                                   "bg-purple-900/30 text-purple-300 border-purple-700/30"
              }`}>{shipmentDirection}</span>
            )}
            {shipmentStatus && (
              <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${
                STATUS_BADGE[shipmentStatus] || "bg-gray-800 text-gray-400 border-gray-600"
              }`}>
                {shipmentStatus.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        {isTerminal && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm text-yellow-300/80">
              <strong className="text-yellow-300">
                This shipment is {shipmentStatus?.toLowerCase().replace(/_/g, " ")}.
              </strong>{" "}
              Terminal shipments cannot be modified.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── Carrier & Tracking ──────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
              Carrier & Tracking
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Carrier</FL>
                <select value={form.carrierId} onChange={set("carrierId")}
                  disabled={isTerminal}
                  className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  <option value="">Select carrier...</option>
                  {carriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <FL>Tracking Number</FL>
                <input type="text" value={form.trackingNumber} onChange={set("trackingNumber")}
                  disabled={isTerminal} placeholder="e.g. 1Z999AA10123456784"
                  className={`${INPUT} font-mono disabled:opacity-50 disabled:cursor-not-allowed`} />
              </div>
              <div>
                <FL>Estimated Delivery Date</FL>
                <input type="date" value={form.estimatedDeliveryDate}
                  onChange={set("estimatedDeliveryDate")}
                  disabled={isTerminal}
                  className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`} />
              </div>
            </div>
          </section>

          {/* ── Destination Address — OUTBOUND only ─────────────── */}
          {isOutbound && (
            <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
                Destination Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FL>Address Line 1</FL>
                  <input type="text" value={destinationAddress.line1} onChange={setAddr("line1")}
                    disabled={isTerminal} placeholder="Street address, building, floor..."
                    className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`} />
                </div>
                <div>
                  <FL>City</FL>
                  <input type="text" value={destinationAddress.city} onChange={setAddr("city")}
                    disabled={isTerminal} placeholder="Dubai"
                    className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`} />
                </div>
                <div>
                  <FL>Country</FL>
                  <input type="text" value={destinationAddress.country} onChange={setAddr("country")}
                    disabled={isTerminal} placeholder="UAE"
                    className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`} />
                </div>
                <div>
                  <FL>Postal Code</FL>
                  <input type="text" value={destinationAddress.postalCode} onChange={setAddr("postalCode")}
                    disabled={isTerminal} placeholder="12345"
                    className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`} />
                </div>
                <div>
                  <FL>Contact Name</FL>
                  <input type="text" value={destinationAddress.contactName} onChange={setAddr("contactName")}
                    disabled={isTerminal} placeholder="Recipient name"
                    className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`} />
                </div>
                <div>
                  <FL>Contact Phone</FL>
                  <input type="tel" value={destinationAddress.contactPhone} onChange={setAddr("contactPhone")}
                    disabled={isTerminal} placeholder="+971-50-123-4567"
                    className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`} />
                </div>
              </div>
            </section>
          )}

          {/* ── Notes ───────────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <FL>Notes / Special Instructions</FL>
            <textarea value={form.notes} onChange={set("notes")} rows={2}
              placeholder="Handling instructions, customs info, special delivery notes..."
              className={`${INPUT} resize-none`} />
          </section>

          {/* ── Items (read-only) ────────────────────────────────── */}
          {readOnlyItems.length > 0 && (
            <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3 mb-5">
                Shipment Items
                <span className="ml-2 text-gray-600 font-normal normal-case text-xs">(read-only after creation)</span>
              </h2>
              <div className="space-y-2">
                {readOnlyItems.map((item, i) => (
                  <div key={item.id || i}
                    className="flex items-center gap-4 px-4 py-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                    <span className="text-gray-500 text-xs font-mono w-5 shrink-0">{i + 1}.</span>
                    <span className="text-gray-400 text-sm flex-1 font-mono">{item.skuId}</span>
                    <span className="text-gray-300 text-sm font-mono">×{item.quantity}</span>
                    {item.unitCost != null && (
                      <span className="text-gray-500 text-xs">${item.unitCost}</span>
                    )}
                    {item.notes && (
                      <span className="text-gray-600 text-xs italic truncate max-w-[120px]">{item.notes}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex gap-4 justify-end">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm">
              Cancel
            </button>
            {!isTerminal && (
              <button type="submit" disabled={loading}
                className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
