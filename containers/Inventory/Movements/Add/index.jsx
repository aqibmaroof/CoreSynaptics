"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  recordStockMovement,
  getProducts,
  getSKUs,
  getWarehouses,
} from "@/services/Inventory";

const MOVEMENT_TYPES = [
  { value: "IN",         label: "Stock In",    desc: "Receive new stock into a warehouse (purchase, delivery)",    icon: "↓", color: "border-green-500/50 bg-green-900/20" },
  { value: "OUT",        label: "Stock Out",   desc: "Issue stock out of a warehouse (usage, project supply)",     icon: "↑", color: "border-red-500/50 bg-red-900/20" },
  { value: "TRANSFER",   label: "Transfer",    desc: "Move stock between two warehouses",                         icon: "⇄", color: "border-blue-500/50 bg-blue-900/20" },
  { value: "RETURN",     label: "Return",      desc: "Return stock back to warehouse from a project or site",     icon: "↩", color: "border-yellow-500/50 bg-yellow-900/20" },
  { value: "ADJUSTMENT", label: "Adjustment",  desc: "Manual correction after a stock count or discrepancy",      icon: "±", color: "border-purple-500/50 bg-purple-900/20" },
];

const REFERENCE_TYPES = [
  "Purchase Order",
  "Sales Order",
  "Shipment",
  "Project Issue",
  "Stock Count",
  "Return Note",
  "Manual Entry",
  "Other",
];

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-red-400 ml-1">*</span>}
  </label>
);
const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

export default function MovementsAdd() {
  const router = useRouter();

  const [products, setProducts]     = useState([]);
  const [skus, setSkus]             = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingSkus, setLoadingSkus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState(null);
  const [errors, setErrors]         = useState({});

  const [form, setForm] = useState({
    movement_type:      "IN",
    product_id:         "",
    sku_id:             "",
    from_warehouse_id:  "",
    to_warehouse_id:    "",
    quantity:           "",
    reference_type:     "Purchase Order",
    reference_id:       "",
    project_id:         "",
    notes:              "",
  });

  useEffect(() => { fetchDropdowns(); }, []);

  // When product changes, load its SKUs
  useEffect(() => {
    if (!form.product_id) { setSkus([]); setForm((f) => ({ ...f, sku_id: "" })); return; }
    setLoadingSkus(true);
    getSKUs({ product_id: form.product_id })
      .then((res) => setSkus(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setSkus([]))
      .finally(() => setLoadingSkus(false));
    setForm((f) => ({ ...f, sku_id: "" }));
  }, [form.product_id]);

  async function fetchDropdowns() {
    try {
      const [pr, wh] = await Promise.all([getProducts(), getWarehouses()]);
      setProducts(Array.isArray(pr) ? pr : pr?.data || []);
      setWarehouses(Array.isArray(wh) ? wh : wh?.data || []);
    } catch {
      setMsg({ type: "error", text: "Failed to load products/warehouses" });
    }
  }

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((f) => ({ ...f, [k]: "" }));
  };

  const setType = (t) => {
    setForm((f) => ({
      ...f,
      movement_type: t,
      from_warehouse_id: "",
      to_warehouse_id: "",
    }));
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.product_id)   e.product_id  = "Product is required";
    if (!form.sku_id)       e.sku_id      = "SKU is required";
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
                             e.quantity   = "Enter a valid quantity greater than 0";

    const type = form.movement_type;
    if (["OUT", "TRANSFER", "RETURN"].includes(type) && !form.from_warehouse_id)
      e.from_warehouse_id = "Source warehouse is required";
    if (["IN", "TRANSFER"].includes(type) && !form.to_warehouse_id)
      e.to_warehouse_id = "Destination warehouse is required";
    if (type === "TRANSFER" && form.from_warehouse_id && form.to_warehouse_id &&
        form.from_warehouse_id === form.to_warehouse_id)
      e.to_warehouse_id = "Source and destination warehouses must be different";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await recordStockMovement({
        ...form,
        quantity: Number(form.quantity),
        from_warehouse_id: form.from_warehouse_id || null,
        to_warehouse_id:   form.to_warehouse_id   || null,
        project_id:        form.project_id        || null,
        reference_id:      form.reference_id      || null,
      });
      setMsg({ type: "success", text: "Stock movement recorded successfully" });
      setTimeout(() => router.push("/Inventory/Movements/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to record movement" });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = MOVEMENT_TYPES.find((t) => t.value === form.movement_type);
  const needsFrom  = ["OUT", "TRANSFER", "RETURN"].includes(form.movement_type);
  const needsTo    = ["IN", "TRANSFER"].includes(form.movement_type);
  const onlyFrom   = form.movement_type === "ADJUSTMENT"; // adjustment shows "warehouse" (mapped to from)

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {msg && (
          <div className={`fixed top-26 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
            msg.type === "success"
              ? "bg-green-900/80 border-green-500/30 text-green-300"
              : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>
            {msg.text}
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Movements
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Record Stock Movement</h1>
        <p className="text-gray-400 mb-8">Log an inventory event — receipt, issue, transfer, return, or adjustment.</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Movement Type Selector */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Movement Type <span className="text-red-400">*</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MOVEMENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    form.movement_type === t.value
                      ? t.color + " border-opacity-100"
                      : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{t.icon}</span>
                    <span className={`font-semibold text-sm ${
                      form.movement_type === t.value ? "text-white" : "text-gray-300"
                    }`}>{t.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Product & SKU */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Details</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Product</FL>
                <select value={form.product_id} onChange={set("product_id")}
                  className={`${INPUT} ${errors.product_id ? "border-red-500" : ""}`}>
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <Err msg={errors.product_id} />
              </div>

              <div>
                <FL required>SKU / Variant</FL>
                <select
                  value={form.sku_id}
                  onChange={set("sku_id")}
                  disabled={!form.product_id || loadingSkus}
                  className={`${INPUT} ${errors.sku_id ? "border-red-500" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {!form.product_id ? "Select a product first" : loadingSkus ? "Loading SKUs..." : "Select SKU..."}
                  </option>
                  {skus.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sku_code} {s.attributes ? `— ${Object.values(s.attributes).join(", ")}` : ""}
                    </option>
                  ))}
                </select>
                <Err msg={errors.sku_id} />
                {form.product_id && skus.length === 0 && !loadingSkus && (
                  <p className="text-yellow-500 text-xs mt-1">No SKUs found for this product. Add SKUs first.</p>
                )}
              </div>
            </div>

            <div className="md:w-1/3">
              <FL required>Quantity</FL>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={set("quantity")}
                placeholder="e.g. 50"
                className={`${INPUT} ${errors.quantity ? "border-red-500" : ""}`}
              />
              <Err msg={errors.quantity} />
            </div>
          </div>

          {/* Warehouse */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Warehouse</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* FROM warehouse — shown for OUT, TRANSFER, RETURN, ADJUSTMENT */}
              {(needsFrom || onlyFrom) && (
                <div>
                  <FL required={needsFrom}>{form.movement_type === "ADJUSTMENT" ? "Warehouse" : "From Warehouse"}</FL>
                  <select
                    value={form.from_warehouse_id}
                    onChange={set("from_warehouse_id")}
                    className={`${INPUT} ${errors.from_warehouse_id ? "border-red-500" : ""}`}
                  >
                    <option value="">Select warehouse...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}{w.location ? ` — ${w.location}` : ""}</option>
                    ))}
                  </select>
                  <Err msg={errors.from_warehouse_id} />
                </div>
              )}

              {/* TO warehouse — shown for IN, TRANSFER */}
              {needsTo && (
                <div>
                  <FL required>To Warehouse</FL>
                  <select
                    value={form.to_warehouse_id}
                    onChange={set("to_warehouse_id")}
                    className={`${INPUT} ${errors.to_warehouse_id ? "border-red-500" : ""}`}
                  >
                    <option value="">Select warehouse...</option>
                    {warehouses
                      .filter((w) => w.id !== form.from_warehouse_id)
                      .map((w) => (
                        <option key={w.id} value={w.id}>{w.name}{w.location ? ` — ${w.location}` : ""}</option>
                      ))}
                  </select>
                  <Err msg={errors.to_warehouse_id} />
                </div>
              )}
            </div>

            {warehouses.length === 0 && (
              <p className="text-yellow-500 text-xs">
                No warehouses configured.{" "}
                <button type="button" className="underline" onClick={() => router.push("/Inventory/Warehouses/List")}>
                  Add a warehouse first.
                </button>
              </p>
            )}
          </div>

          {/* Reference & Context */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reference & Context</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Reference Type</FL>
                <select value={form.reference_type} onChange={set("reference_type")} className={INPUT}>
                  {REFERENCE_TYPES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <FL>Reference Number</FL>
                <input
                  type="text"
                  value={form.reference_id}
                  onChange={set("reference_id")}
                  placeholder="e.g. PO-2026-0042"
                  className={`${INPUT} font-mono`}
                />
              </div>
            </div>

            <div>
              <FL>Project ID (optional)</FL>
              <input
                type="text"
                value={form.project_id}
                onChange={set("project_id")}
                placeholder="Link this movement to a project (UUID or code)"
                className={INPUT}
              />
              <p className="text-gray-600 text-xs mt-1">Used for cost tracking and project-level stock reporting</p>
            </div>

            <div>
              <FL>Notes</FL>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Additional context, reason for adjustment, delivery notes..."
                className={`${INPUT} resize-none`}
              />
            </div>
          </div>

          {/* Summary preview */}
          {form.product_id && form.quantity && (
            <div className={`rounded-xl border-2 p-5 ${selectedType.color}`}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Movement Summary</p>
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <span className="text-2xl">{selectedType.icon}</span>
                <span className="text-white font-semibold">{selectedType.label}</span>
                <span className="text-gray-400">·</span>
                <span className="text-white font-bold">{form.quantity} units</span>
                {form.from_warehouse_id && (
                  <>
                    <span className="text-gray-400">from</span>
                    <span className="text-white">{warehouses.find((w) => w.id === form.from_warehouse_id)?.name || "—"}</span>
                  </>
                )}
                {form.to_warehouse_id && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className="text-white">{warehouses.find((w) => w.id === form.to_warehouse_id)?.name || "—"}</span>
                  </>
                )}
                {form.reference_id && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-300 font-mono text-xs">{form.reference_id}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end pb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {submitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {submitting ? "Recording..." : "Record Movement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
