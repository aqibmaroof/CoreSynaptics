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

const emptyItem = () => ({ sku_id: "", quantity: 1 });

export default function ShipmentAdd() {
  const router = useRouter();

  const [carriers, setCarriers]     = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [skus, setSKUs]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState(null);
  const [errors, setErrors]         = useState({});

  const [form, setForm] = useState({
    origin_warehouse_id:     "",
    destination_address:     "",
    carrier_id:              "",
    estimated_delivery_date: "",
    order_id:                "",
    notes:                   "",
  });

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

  const setItem = (i, k) => (e) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: e.target.value } : item));

  const addItem    = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!form.origin_warehouse_id) e.origin_warehouse_id = "Origin warehouse required";
    if (!form.destination_address.trim()) e.destination_address = "Destination address required";
    if (!form.carrier_id) e.carrier_id = "Carrier is required";
    if (items.some((it) => !it.sku_id || it.quantity < 1)) e.items = "All items need a valid SKU and quantity ≥ 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createShipment({ ...form, items });
      setMsg({ type: "success", text: "Shipment created — stock reservation initiated" });
      setTimeout(() => router.push("/Shipments/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to create shipment" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {msg && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
            msg.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>{msg.text}</div>
        )}

        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Shipments
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Create Shipment</h1>
        <p className="text-gray-400 mb-8">
          A unique shipment number is auto-generated. Stock will be reserved on creation and deducted on delivery.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── Route ───────────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">Route & Carrier</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Origin Warehouse</FL>
                <select value={form.origin_warehouse_id} onChange={set("origin_warehouse_id")}
                  className={`${INPUT} ${errors.origin_warehouse_id ? "border-red-500" : ""}`}>
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                {errors.origin_warehouse_id && <p className="text-red-400 text-xs mt-1">{errors.origin_warehouse_id}</p>}
              </div>
              <div>
                <FL required>Carrier</FL>
                <select value={form.carrier_id} onChange={set("carrier_id")}
                  className={`${INPUT} ${errors.carrier_id ? "border-red-500" : ""}`}>
                  <option value="">Select carrier...</option>
                  {carriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.carrier_id && <p className="text-red-400 text-xs mt-1">{errors.carrier_id}</p>}
              </div>
            </div>

            <div>
              <FL required>Destination Address</FL>
              <textarea value={form.destination_address} onChange={set("destination_address")} rows={2}
                placeholder="Full delivery address including city, country, ZIP..."
                className={`${INPUT} resize-none ${errors.destination_address ? "border-red-500" : ""}`} />
              {errors.destination_address && <p className="text-red-400 text-xs mt-1">{errors.destination_address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Estimated Delivery Date</FL>
                <input type="date" value={form.estimated_delivery_date} onChange={set("estimated_delivery_date")}
                  min={new Date().toISOString().split("T")[0]} className={INPUT} />
              </div>
              <div>
                <FL>Linked Order ID</FL>
                <input type="text" value={form.order_id} onChange={set("order_id")}
                  placeholder="Optional order reference" className={`${INPUT} font-mono`} />
              </div>
            </div>
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
                <div key={i} className="flex items-end gap-3">
                  <div className="flex-1">
                    {i === 0 && <FL required>SKU</FL>}
                    <select value={item.sku_id} onChange={setItem(i, "sku_id")} className={INPUT}>
                      <option value="">Select SKU...</option>
                      {skus.map((s) => <option key={s.id} value={s.id}>{s.sku_code} — {s.product?.name}</option>)}
                    </select>
                  </div>
                  <div className="w-28">
                    {i === 0 && <FL required>Qty</FL>}
                    <input type="number" min={1} value={item.quantity} onChange={setItem(i, "quantity")}
                      className={`${INPUT} font-mono`} />
                  </div>
                  {items.length > 1 && (
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

          {/* ── Notes ───────────────────────────────────────────── */}
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
              {loading ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
