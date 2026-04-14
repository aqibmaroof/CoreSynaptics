"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createShipment, getCarriers } from "@/services/ShipmentLogistics";
import { getWarehouses, getSKUs } from "@/services/Inventory";

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-red-400 ml-1">*</span>}
  </label>
);

const DIRECTIONS = ["OUTBOUND", "INBOUND", "TRANSFER"];

const emptyItem = () => ({ skuId: "", quantity: 1, unitCost: "", notes: "" });

const emptyAddress = () => ({
  line1: "", city: "", country: "", postalCode: "", contactName: "", contactPhone: "",
});

export default function ShipmentAdd() {
  const router = useRouter();

  const [carriers, setCarriers]     = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [skus, setSKUs]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState(null);
  const [errors, setErrors]         = useState({});

  const [form, setForm] = useState({
    direction:               "OUTBOUND",
    originWarehouseId:       "",
    destinationWarehouseId:  "",
    carrierId:               "",
    trackingNumber:          "",
    estimatedDeliveryDate:   "",
    notes:                   "",
  });

  const [destinationAddress, setDestinationAddress] = useState(emptyAddress());
  const [items, setItems] = useState([emptyItem()]);

  useEffect(() => {
    getCarriers().then((r) => setCarriers(Array.isArray(r) ? r : r?.data || [])).catch(() => {});
    getWarehouses().then((r) => setWarehouses(Array.isArray(r) ? r : r?.data || [])).catch(() => {});
    getSKUs().then((r) => setSKUs(Array.isArray(r) ? r : r?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const setAddr = (k) => (e) => {
    setDestinationAddress((p) => ({ ...p, [k]: e.target.value }));
    if (errors[`addr_${k}`]) setErrors((p) => ({ ...p, [`addr_${k}`]: "" }));
  };

  const setItem = (i, k) => (e) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: e.target.value } : item));

  const addItem    = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!form.direction)         e.direction = "Direction is required";
    if (!form.originWarehouseId) e.originWarehouseId = "Origin warehouse is required";

    if (form.direction === "OUTBOUND") {
      if (!destinationAddress.line1.trim())    e.addr_line1   = "Address line 1 is required";
      if (!destinationAddress.city.trim())     e.addr_city    = "City is required";
      if (!destinationAddress.country.trim())  e.addr_country = "Country is required";
    }

    if (form.direction === "TRANSFER") {
      if (!form.destinationWarehouseId) e.destinationWarehouseId = "Destination warehouse is required";
      if (form.destinationWarehouseId === form.originWarehouseId)
        e.destinationWarehouseId = "Origin and destination warehouse must differ";
    }

    if (items.some((it) => !it.skuId || Number(it.quantity) < 1))
      e.items = "All items need a valid SKU and quantity ≥ 1";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        direction:             form.direction,
        originWarehouseId:     form.originWarehouseId,
        carrierId:             form.carrierId || undefined,
        trackingNumber:        form.trackingNumber || undefined,
        estimatedDeliveryDate: form.estimatedDeliveryDate
          ? new Date(form.estimatedDeliveryDate).toISOString()
          : undefined,
        notes: form.notes || undefined,
        items: items.map((it) => ({
          skuId:    it.skuId,
          quantity: Number(it.quantity),
          unitCost: it.unitCost ? Number(it.unitCost) : undefined,
          notes:    it.notes || undefined,
        })),
      };

      if (form.direction === "OUTBOUND") {
        payload.destinationAddress = destinationAddress;
      }
      if (form.direction === "TRANSFER") {
        payload.destinationWarehouseId = form.destinationWarehouseId;
      }

      await createShipment(payload);
      setMsg({ type: "success", text: "Shipment created successfully" });
      setTimeout(() => router.push("/Shipments/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to create shipment" });
    } finally { setLoading(false); }
  };

  const isOutbound = form.direction === "OUTBOUND";
  const isTransfer = form.direction === "TRANSFER";

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

        <h1 className="text-4xl font-bold text-white mb-2">Create Shipment</h1>
        <p className="text-gray-400 mb-8">
          A unique shipment number is auto-generated. Stock is deducted when the shipment is picked up.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── Direction ───────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3 mb-5">
              Shipment Type
            </h2>
            <div className="flex gap-3">
              {DIRECTIONS.map((d) => (
                <button key={d} type="button"
                  onClick={() => { setForm((p) => ({ ...p, direction: d })); setErrors({}); }}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                    form.direction === d
                      ? d === "OUTBOUND" ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                        : d === "INBOUND" ? "bg-green-600/20 border-green-500/50 text-green-300"
                        : "bg-purple-600/20 border-purple-500/50 text-purple-300"
                      : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                  }`}>
                  {d === "OUTBOUND" ? "⬆ Outbound" : d === "INBOUND" ? "⬇ Inbound" : "↔ Transfer"}
                </button>
              ))}
            </div>
            {errors.direction && <p className="text-red-400 text-xs mt-2">{errors.direction}</p>}
          </section>

          {/* ── Route & Carrier ─────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
              Route & Carrier
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Origin Warehouse</FL>
                <select value={form.originWarehouseId} onChange={set("originWarehouseId")}
                  className={`${INPUT} ${errors.originWarehouseId ? "border-red-500" : ""}`}>
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                {errors.originWarehouseId && <p className="text-red-400 text-xs mt-1">{errors.originWarehouseId}</p>}
              </div>

              {isTransfer && (
                <div>
                  <FL required>Destination Warehouse</FL>
                  <select value={form.destinationWarehouseId} onChange={set("destinationWarehouseId")}
                    className={`${INPUT} ${errors.destinationWarehouseId ? "border-red-500" : ""}`}>
                    <option value="">Select warehouse...</option>
                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  {errors.destinationWarehouseId && (
                    <p className="text-red-400 text-xs mt-1">{errors.destinationWarehouseId}</p>
                  )}
                </div>
              )}

              <div>
                <FL>Carrier</FL>
                <select value={form.carrierId} onChange={set("carrierId")} className={INPUT}>
                  <option value="">Select carrier...</option>
                  {carriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <FL>Tracking Number</FL>
                <input type="text" value={form.trackingNumber} onChange={set("trackingNumber")}
                  placeholder="e.g. 1Z999AA10123456784" className={`${INPUT} font-mono`} />
              </div>

              <div>
                <FL>Estimated Delivery Date</FL>
                <input type="date" value={form.estimatedDeliveryDate}
                  onChange={set("estimatedDeliveryDate")}
                  min={new Date().toISOString().split("T")[0]} className={INPUT} />
              </div>
            </div>

            {/* Destination address — OUTBOUND only */}
            {isOutbound && (
              <div className="pt-2 border-t border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Destination Address <span className="text-red-400">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FL required>Address Line 1</FL>
                    <input type="text" value={destinationAddress.line1} onChange={setAddr("line1")}
                      placeholder="Street address, building, floor..."
                      className={`${INPUT} ${errors.addr_line1 ? "border-red-500" : ""}`} />
                    {errors.addr_line1 && <p className="text-red-400 text-xs mt-1">{errors.addr_line1}</p>}
                  </div>
                  <div>
                    <FL required>City</FL>
                    <input type="text" value={destinationAddress.city} onChange={setAddr("city")}
                      placeholder="Dubai"
                      className={`${INPUT} ${errors.addr_city ? "border-red-500" : ""}`} />
                    {errors.addr_city && <p className="text-red-400 text-xs mt-1">{errors.addr_city}</p>}
                  </div>
                  <div>
                    <FL required>Country</FL>
                    <input type="text" value={destinationAddress.country} onChange={setAddr("country")}
                      placeholder="UAE"
                      className={`${INPUT} ${errors.addr_country ? "border-red-500" : ""}`} />
                    {errors.addr_country && <p className="text-red-400 text-xs mt-1">{errors.addr_country}</p>}
                  </div>
                  <div>
                    <FL>Postal Code</FL>
                    <input type="text" value={destinationAddress.postalCode} onChange={setAddr("postalCode")}
                      placeholder="12345" className={INPUT} />
                  </div>
                  <div>
                    <FL>Contact Name</FL>
                    <input type="text" value={destinationAddress.contactName} onChange={setAddr("contactName")}
                      placeholder="Ahmed Al-Rashid" className={INPUT} />
                  </div>
                  <div>
                    <FL>Contact Phone</FL>
                    <input type="tel" value={destinationAddress.contactPhone} onChange={setAddr("contactPhone")}
                      placeholder="+971-50-123-4567" className={INPUT} />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Items ───────────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-5">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Shipment Items</h2>
              <button type="button" onClick={addItem}
                className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add SKU
              </button>
            </div>

            {errors.items && <p className="text-red-400 text-xs mb-3">{errors.items}</p>}

            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-end">
                  {/* SKU */}
                  <div className="col-span-4">
                    {i === 0 && <FL required>SKU</FL>}
                    <select value={item.skuId} onChange={setItem(i, "skuId")} className={INPUT}>
                      <option value="">Select SKU...</option>
                      {skus.map((s) => (
                        <option key={s.id} value={s.id}>{s.skuCode ?? s.sku_code} — {s.product?.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Qty */}
                  <div className="col-span-2">
                    {i === 0 && <FL required>Qty</FL>}
                    <input type="number" min={1} value={item.quantity} onChange={setItem(i, "quantity")}
                      className={`${INPUT} font-mono`} />
                  </div>
                  {/* Unit Cost */}
                  <div className="col-span-2">
                    {i === 0 && <FL>Unit Cost</FL>}
                    <input type="number" min={0} step="0.01" value={item.unitCost}
                      onChange={setItem(i, "unitCost")} placeholder="0.00"
                      className={`${INPUT} font-mono`} />
                  </div>
                  {/* Item Notes */}
                  <div className="col-span-3">
                    {i === 0 && <FL>Notes</FL>}
                    <input type="text" value={item.notes} onChange={setItem(i, "notes")}
                      placeholder="e.g. Fragile" className={INPUT} />
                  </div>
                  {/* Remove */}
                  <div className="col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="text-red-400 hover:text-red-300 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Notes ───────────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <FL>Notes / Special Instructions</FL>
            <textarea value={form.notes} onChange={set("notes")} rows={2}
              placeholder="Handling instructions, customs info, special delivery notes..."
              className={`${INPUT} resize-none`} />
          </section>

          <div className="flex gap-4 justify-end">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
