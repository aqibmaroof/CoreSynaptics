"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getShipmentById, updateShipment, getCarriers, getShipmentItems } from "@/services/ShipmentLogistics";
import { getWarehouses, getSKUs } from "@/services/Inventory";

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-red-400 ml-1">*</span>}
  </label>
);

const STATUS_BADGE = {
  CREATED: "bg-blue-900/30 text-blue-300 border-blue-500/30",
  PICKED_UP: "bg-cyan-900/30 text-cyan-300 border-cyan-500/30",
  IN_TRANSIT: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
  OUT_FOR_DELIVERY: "bg-orange-900/30 text-orange-300 border-orange-500/30",
  DELIVERED: "bg-green-900/30 text-green-300 border-green-500/30",
  RETURNED: "bg-purple-900/30 text-purple-300 border-purple-500/30",
  FAILED: "bg-red-900/30 text-red-300 border-red-500/30",
};

export default function ShipmentEdit({ editId }) {
  const router = useRouter();

  const [carriers, setCarriers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [errors, setErrors] = useState({});
  const [shipmentStatus, setShipmentStatus] = useState(null);
  const [shipmentNumber, setShipmentNumber] = useState(null);

  const [form, setForm] = useState({
    origin_warehouse_id: "",
    destination_address: "",
    carrier_id: "",
    estimated_delivery_date: "",
    order_id: "",
    notes: "",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    getCarriers().then((r) => setCarriers(Array.isArray(r) ? r : r?.data || [])).catch(() => { });
    getWarehouses().then((r) => setWarehouses(Array.isArray(r) ? r : r?.data || [])).catch(() => { });
    getSKUs().then((r) => setSKUs(Array.isArray(r) ? r : r?.data || [])).catch(() => { });
  }, []);

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    Promise.all([
      getShipmentById(editId),
      getShipmentItems(editId).catch(() => ({ data: [] })),
    ])
      .then(([shipRes, itemsRes]) => {
        const d = shipRes?.data ?? shipRes;
        setShipmentStatus(d.status);
        setShipmentNumber(d.shipment_number);
        setForm({
          origin_warehouse_id: d.origin_warehouse_id ?? "",
          destination_address: d.destination_address ?? "",
          carrier_id: d.carrier_id ?? "",
          estimated_delivery_date: d.estimated_delivery_date ?? "",
          order_id: d.order_id ?? "",
          notes: d.notes ?? "",
        });
        const loadedItems = Array.isArray(itemsRes) ? itemsRes : itemsRes?.data || [];
        setItems(loadedItems.length > 0
          ? loadedItems.map((i) => ({ sku_id: i.sku_id ?? "", quantity: i.quantity ?? 1 }))
          : [{ sku_id: "", quantity: 1 }]
        );
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

  const setItem = (i, k) => (e) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: e.target.value } : item));

  const addItem = () => setItems((p) => [...p, { sku_id: "", quantity: 1 }]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));

  const isDelivered = ["DELIVERED", "RETURNED", "FAILED"].includes(shipmentStatus);

  const validate = () => {
    const e = {};
    if (!form.origin_warehouse_id) e.origin_warehouse_id = "Origin warehouse required";
    if (!form.destination_address.trim()) e.destination_address = "Destination address required";
    if (!form.carrier_id) e.carrier_id = "Carrier is required";
    if (items.some((it) => !it.sku_id || it.quantity < 1))
      e.items = "All items need a valid SKU and quantity ≥ 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await updateShipment(editId, { ...form, items });
      setMsg({ type: "success", text: "Shipment updated successfully" });
      setTimeout(() => router.push("/Shipments/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to update shipment" });
    } finally { setLoading(false); }
  };

  if (!fetching) {
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
          <button onClick={() => router.back()} className="text-cyan-400 hover:text-cyan-300 text-sm underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {msg && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${msg.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"
            }`}>{msg.text}</div>
        )}

        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shipments
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Edit Shipment</h1>
            {shipmentNumber && (
              <p className="text-gray-400 font-mono text-sm">{shipmentNumber}</p>
            )}
          </div>
          {shipmentStatus && (
            <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${STATUS_BADGE[shipmentStatus] || "bg-gray-800 text-gray-400 border-gray-600"}`}>
              {shipmentStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {isDelivered && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div className="text-sm text-yellow-300/80">
              <strong className="text-yellow-300">This shipment is {shipmentStatus?.toLowerCase().replace(/_/g, " ")}.</strong> Only notes can be amended at this stage.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">Route & Carrier</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Origin Warehouse</FL>
                <select value={form.origin_warehouse_id} onChange={set("origin_warehouse_id")}
                  disabled={isDelivered}
                  className={`${INPUT} ${errors.origin_warehouse_id ? "border-red-500" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                {errors.origin_warehouse_id && <p className="text-red-400 text-xs mt-1">{errors.origin_warehouse_id}</p>}
              </div>
              <div>
                <FL required>Carrier</FL>
                <select value={form.carrier_id} onChange={set("carrier_id")}
                  disabled={isDelivered}
                  className={`${INPUT} ${errors.carrier_id ? "border-red-500" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  <option value="">Select carrier...</option>
                  {carriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.carrier_id && <p className="text-red-400 text-xs mt-1">{errors.carrier_id}</p>}
              </div>
            </div>

            <div>
              <FL required>Destination Address</FL>
              <textarea value={form.destination_address} onChange={set("destination_address")} rows={2}
                disabled={isDelivered}
                placeholder="Full delivery address including city, country, ZIP..."
                className={`${INPUT} resize-none ${errors.destination_address ? "border-red-500" : ""} disabled:opacity-50 disabled:cursor-not-allowed`} />
              {errors.destination_address && <p className="text-red-400 text-xs mt-1">{errors.destination_address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Estimated Delivery Date</FL>
                <input type="date" value={form.estimated_delivery_date} onChange={set("estimated_delivery_date")}
                  className={INPUT} />
              </div>
              <div>
                <FL>Linked Order ID</FL>
                <input type="text" value={form.order_id} onChange={set("order_id")}
                  placeholder="Optional order reference" className={`${INPUT} font-mono`} />
              </div>
            </div>
          </section>

          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-5">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Shipment Items</h2>
              {!isDelivered && (
                <button type="button" onClick={addItem}
                  className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add SKU
                </button>
              )}
            </div>

            {errors.items && <p className="text-red-400 text-xs mb-3">{errors.items}</p>}

            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-end gap-3">
                  <div className="flex-1">
                    {i === 0 && <FL required>SKU</FL>}
                    <select value={item.sku_id} onChange={setItem(i, "sku_id")}
                      disabled={isDelivered}
                      className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <option value="">Select SKU...</option>
                      {skus.map((s) => <option key={s.id} value={s.id}>{s.sku_code} — {s.product?.name}</option>)}
                    </select>
                  </div>
                  <div className="w-28">
                    {i === 0 && <FL required>Qty</FL>}
                    <input type="number" min={1} value={item.quantity} onChange={setItem(i, "quantity")}
                      disabled={isDelivered}
                      className={`${INPUT} font-mono disabled:opacity-50 disabled:cursor-not-allowed`} />
                  </div>
                  {!isDelivered && items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)}
                      className="pb-2 text-red-400 hover:text-red-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <FL>Notes / Special Instructions</FL>
            <textarea value={form.notes} onChange={set("notes")} rows={2}
              placeholder="Handling instructions, customs info, special delivery notes..."
              className={`${INPUT} resize-none`} />
          </section>

          <div className="flex gap-4 justify-end">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
