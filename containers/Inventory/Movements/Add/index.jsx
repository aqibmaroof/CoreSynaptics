"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordStockMovement, getProducts, getSKUsByProduct, getWarehouses, getSuppliers } from "@/services/Inventory";

const MOVEMENT_TYPES = [
  { value: "IN",         label: "Stock In",    desc: "Receive new stock into a warehouse (purchase, delivery)",  icon: "↓", color: "border-green-500/50 bg-green-900/20" },
  { value: "OUT",        label: "Stock Out",   desc: "Issue stock out of a warehouse (usage, project supply)",   icon: "↑", color: "border-red-500/50 bg-red-900/20" },
  { value: "TRANSFER",   label: "Transfer",    desc: "Move stock between two warehouses",                        icon: "⇄", color: "border-blue-500/50 bg-blue-900/20" },
  { value: "RETURN",     label: "Return",      desc: "Return stock back to a warehouse from a site or project",  icon: "↩", color: "border-yellow-500/50 bg-yellow-900/20" },
  { value: "ADJUSTMENT", label: "Adjustment",  desc: "Manual correction after a stock count or discrepancy",    icon: "±", color: "border-purple-500/50 bg-purple-900/20" },
];

const REFERENCE_TYPES = [
  "PURCHASE_ORDER", "SALES_ORDER", "SHIPMENT", "PROJECT_ISSUE",
  "STOCK_COUNT", "RETURN_NOTE", "MANUAL_ENTRY", "OTHER",
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
  const [suppliers, setSuppliers]   = useState([]);
  const [loadingSkus, setLoadingSkus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState(null);
  const [errors, setErrors]         = useState({});

  // UI-only product filter — not sent to API
  const [selectedProduct, setSelectedProduct] = useState("");

  const [form, setForm] = useState({
    type:            "IN",
    skuId:           "",
    warehouseId:     "",   // for IN, OUT, RETURN, ADJUSTMENT (and TRANSFER source)
    toWarehouseId:   "",   // for TRANSFER only
    quantity:        "",
    adjustmentDelta: "",   // for ADJUSTMENT only
    unitCost:        "",
    supplierId:      "",
    referenceType:   "",
    referenceId:     "",
    notes:           "",
  });

  useEffect(() => { fetchDropdowns(); }, []);

  useEffect(() => {
    if (!selectedProduct) { setSkus([]); setForm((f) => ({ ...f, skuId: "" })); return; }
    setLoadingSkus(true);
    getSKUsByProduct(selectedProduct)
      .then((res) => setSkus(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setSkus([]))
      .finally(() => setLoadingSkus(false));
    setForm((f) => ({ ...f, skuId: "" }));
  }, [selectedProduct]);

  async function fetchDropdowns() {
    try {
      const [pr, wh, sp] = await Promise.all([getProducts(), getWarehouses(), getSuppliers().catch(() => ({ data: [] }))]);
      setProducts(Array.isArray(pr) ? pr : pr?.data || []);
      setWarehouses(Array.isArray(wh) ? wh : wh?.data || []);
      setSuppliers(Array.isArray(sp) ? sp : sp?.data || []);
    } catch {
      setMsg({ type: "error", text: "Failed to load products/warehouses" });
    }
  }

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((f) => ({ ...f, [k]: "" }));
  };

  const setType = (t) => {
    setForm((f) => ({ ...f, type: t, warehouseId: "", toWarehouseId: "", adjustmentDelta: "" }));
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.skuId) e.skuId = "SKU is required";
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
      e.quantity = "Enter a valid quantity greater than 0";
    if (!form.warehouseId) e.warehouseId = "Warehouse is required";

    if (form.type === "TRANSFER") {
      if (!form.toWarehouseId) e.toWarehouseId = "Destination warehouse is required";
      if (form.toWarehouseId && form.toWarehouseId === form.warehouseId)
        e.toWarehouseId = "Source and destination warehouses must differ";
    }
    if (form.type === "ADJUSTMENT") {
      if (form.adjustmentDelta === "" || isNaN(form.adjustmentDelta))
        e.adjustmentDelta = "Adjustment delta is required (positive or negative integer)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        skuId:       form.skuId,
        type:        form.type,
        quantity:    Number(form.quantity),
        warehouseId: form.warehouseId,
        notes:       form.notes || undefined,
        referenceType: form.referenceType || undefined,
        referenceId:   form.referenceId   || undefined,
        supplierId:  form.supplierId || undefined,
        unitCost:    form.unitCost   ? Number(form.unitCost) : undefined,
      };
      if (form.type === "TRANSFER") {
        payload.toWarehouseId = form.toWarehouseId;
      }
      if (form.type === "ADJUSTMENT") {
        payload.adjustmentDelta = Number(form.adjustmentDelta);
      }
      await recordStockMovement(payload);
      setMsg({ type: "success", text: "Stock movement recorded successfully" });
      setTimeout(() => router.push("/Inventory/Movements/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || err?.message || "Failed to record movement" });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType  = MOVEMENT_TYPES.find((t) => t.value === form.type);
  const isTransfer    = form.type === "TRANSFER";
  const isAdjustment  = form.type === "ADJUSTMENT";

  const whLabel = {
    IN:         "Receiving Warehouse",
    OUT:        "Source Warehouse",
    RETURN:     "Return Warehouse",
    TRANSFER:   "From Warehouse",
    ADJUSTMENT: "Warehouse",
  }[form.type] || "Warehouse";

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {msg && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
            msg.type === "success"
              ? "bg-green-900/80 border-green-500/30 text-green-300"
              : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>
            {msg.text}
          </div>
        )}

        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
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
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    form.type === t.value
                      ? t.color + " border-opacity-100"
                      : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{t.icon}</span>
                    <span className={`font-semibold text-sm ${form.type === t.value ? "text-white" : "text-gray-300"}`}>
                      {t.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Product & SKU */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Product Details
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product filter — UI only, not sent to API */}
              <div>
                <FL>Product (filter)</FL>
                <select value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)} className={INPUT}>
                  <option value="">All Products</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <p className="text-gray-600 text-xs mt-1">Filters the SKU list below</p>
              </div>

              <div>
                <FL required>SKU</FL>
                <select value={form.skuId} onChange={set("skuId")}
                  disabled={loadingSkus}
                  className={`${INPUT} ${errors.skuId ? "border-red-500" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  <option value="">
                    {loadingSkus ? "Loading SKUs..." : selectedProduct ? "Select SKU..." : "Select a product or pick SKU directly..."}
                  </option>
                  {skus.length > 0
                    ? skus.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code}{s.name ? ` — ${s.name}` : ""}
                          {s.attributes ? ` (${Object.values(s.attributes).join(", ")})` : ""}
                        </option>
                      ))
                    : !selectedProduct && products.map((p) =>
                        <optgroup key={p.id} label={p.name} />
                      )
                  }
                </select>
                <Err msg={errors.skuId} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <FL required>Quantity</FL>
                <input type="number" min="1" step="1" value={form.quantity} onChange={set("quantity")}
                  placeholder="e.g. 10"
                  className={`${INPUT} font-mono ${errors.quantity ? "border-red-500" : ""}`} />
                <Err msg={errors.quantity} />
              </div>

              <div>
                <FL>Unit Cost</FL>
                <input type="number" min="0" step="0.01" value={form.unitCost} onChange={set("unitCost")}
                  placeholder="0.00" className={`${INPUT} font-mono`} />
              </div>

              {form.type === "IN" && (
                <div>
                  <FL>Supplier</FL>
                  <select value={form.supplierId} onChange={set("supplierId")} className={INPUT}>
                    <option value="">Select supplier...</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Warehouse */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Warehouse
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>{whLabel}</FL>
                <select value={form.warehouseId} onChange={set("warehouseId")}
                  className={`${INPUT} ${errors.warehouseId ? "border-red-500" : ""}`}>
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}{w.code ? ` (${w.code})` : ""}
                    </option>
                  ))}
                </select>
                <Err msg={errors.warehouseId} />
              </div>

              {isTransfer && (
                <div>
                  <FL required>To Warehouse</FL>
                  <select value={form.toWarehouseId} onChange={set("toWarehouseId")}
                    className={`${INPUT} ${errors.toWarehouseId ? "border-red-500" : ""}`}>
                    <option value="">Select warehouse...</option>
                    {warehouses
                      .filter((w) => w.id !== form.warehouseId)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}{w.code ? ` (${w.code})` : ""}
                        </option>
                      ))}
                  </select>
                  <Err msg={errors.toWarehouseId} />
                </div>
              )}

              {isAdjustment && (
                <div>
                  <FL required>Adjustment Delta</FL>
                  <input type="number" step="1" value={form.adjustmentDelta} onChange={set("adjustmentDelta")}
                    placeholder="e.g. +5 or -3"
                    className={`${INPUT} font-mono ${errors.adjustmentDelta ? "border-red-500" : ""}`} />
                  <p className="text-gray-600 text-xs mt-1">Positive to increase stock, negative to decrease. Cannot result in negative stock.</p>
                  <Err msg={errors.adjustmentDelta} />
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

          {/* Reference */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Reference & Notes
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Reference Type</FL>
                <select value={form.referenceType} onChange={set("referenceType")} className={INPUT}>
                  <option value="">None</option>
                  {REFERENCE_TYPES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <FL>Reference Number</FL>
                <input type="text" value={form.referenceId} onChange={set("referenceId")}
                  placeholder="e.g. PO-2026-0042" className={`${INPUT} font-mono`} />
              </div>
            </div>

            <div>
              <FL>Notes</FL>
              <textarea value={form.notes} onChange={set("notes")} rows={3}
                placeholder="Additional context, reason for adjustment, delivery details..."
                className={`${INPUT} resize-none`} />
            </div>
          </div>

          {/* Summary preview */}
          {form.skuId && form.quantity && (
            <div className={`rounded-xl border-2 p-5 ${selectedType.color}`}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Movement Summary</p>
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <span className="text-2xl">{selectedType.icon}</span>
                <span className="text-white font-semibold">{selectedType.label}</span>
                <span className="text-gray-400">·</span>
                <span className="text-white font-bold">{form.quantity} units</span>
                {form.warehouseId && (
                  <>
                    <span className="text-gray-400">{isTransfer ? "from" : "at"}</span>
                    <span className="text-white">{warehouses.find((w) => w.id === form.warehouseId)?.name || "—"}</span>
                  </>
                )}
                {isTransfer && form.toWarehouseId && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className="text-white">{warehouses.find((w) => w.id === form.toWarehouseId)?.name || "—"}</span>
                  </>
                )}
                {isAdjustment && form.adjustmentDelta !== "" && (
                  <>
                    <span className="text-gray-400">delta</span>
                    <span className={Number(form.adjustmentDelta) >= 0 ? "text-green-400 font-mono" : "text-red-400 font-mono"}>
                      {Number(form.adjustmentDelta) >= 0 ? "+" : ""}{form.adjustmentDelta}
                    </span>
                  </>
                )}
                {form.referenceId && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-300 font-mono text-xs">{form.referenceId}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end pb-6">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all">
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
