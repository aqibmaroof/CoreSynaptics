"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStockMovements, getWarehouses } from "@/services/Inventory";
import sendRequest from "@/services/instance/sendRequest";

/** Only notes and reference fields are mutable after a movement is recorded. */
const updateStockMovement = (id, payload) =>
  sendRequest({ url: `/inventory/stock/movements/${id}`, method: "PATCH", data: payload });

const MOVEMENT_TYPE_META = {
  IN:         { icon: "↓", label: "Stock In",   color: "border-green-500/50 bg-green-900/20 text-green-300" },
  OUT:        { icon: "↑", label: "Stock Out",  color: "border-red-500/50 bg-red-900/20 text-red-300" },
  TRANSFER:   { icon: "⇄", label: "Transfer",   color: "border-blue-500/50 bg-blue-900/20 text-blue-300" },
  RETURN:     { icon: "↩", label: "Return",     color: "border-yellow-500/50 bg-yellow-900/20 text-yellow-300" },
  ADJUSTMENT: { icon: "±", label: "Adjustment", color: "border-purple-500/50 bg-purple-900/20 text-purple-300" },
};

const REFERENCE_TYPES = [
  "PURCHASE_ORDER", "SALES_ORDER", "SHIPMENT", "PROJECT_ISSUE",
  "STOCK_COUNT", "RETURN_NOTE", "MANUAL_ENTRY", "OTHER",
];

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const INPUT_READONLY = "w-full px-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-gray-400 text-sm cursor-not-allowed select-none";
const FL = ({ children }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{children}</label>
);

export default function MovementsEdit({ editId }) {
  const router = useRouter();

  const [warehouses, setWarehouses] = useState([]);
  const [record, setRecord]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg]               = useState(null);

  const [form, setForm] = useState({
    referenceType: "",
    referenceId:   "",
    notes:         "",
  });

  useEffect(() => {
    getWarehouses().then((r) => setWarehouses(Array.isArray(r) ? r : r?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    getStockMovements({ page: 1, limit: 200 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        const d = list.find((m) => String(m.id) === String(editId));
        if (!d) throw new Error("Not found");
        setRecord(d);
        setForm({
          referenceType: d.referenceType ?? "",
          referenceId:   d.referenceId   ?? "",
          notes:         d.notes         ?? "",
        });
      })
      .catch(() => setFetchError("Failed to load movement record."))
      .finally(() => setFetching(false));
  }, [editId]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await updateStockMovement(editId, {
        referenceType: form.referenceType || undefined,
        referenceId:   form.referenceId   || undefined,
        notes:         form.notes         || undefined,
      });
      setMsg({ type: "success", text: "Movement notes updated" });
      setTimeout(() => router.push("/Inventory/Movements/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to update movement" });
    } finally { setLoading(false); }
  };

  const whName = (id) => warehouses.find((w) => w.id === id)?.name ?? id ?? "—";

  if (fetching) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading movement...
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

  const meta = record
    ? (MOVEMENT_TYPE_META[record.type] ?? { icon: "·", label: record.type, color: "border-gray-600 bg-gray-800/40 text-gray-300" })
    : null;

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
          Back to Movements
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Edit Movement</h1>
        <p className="text-gray-400 mb-8">
          Stock movements are immutable once recorded. You can update reference information and notes below.
        </p>

        {/* Read-only movement summary */}
        {record && meta && (
          <div className={`mb-6 rounded-xl border-2 p-5 ${meta.color}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Movement Record (read-only)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Type</p>
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <span>{meta.icon}</span> {meta.label}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Quantity</p>
                <p className="text-white font-bold">{record.quantity}</p>
              </div>
              {record.warehouseId && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">
                    {record.type === "TRANSFER" ? "From" : "Warehouse"}
                  </p>
                  <p className="text-white">{whName(record.warehouseId)}</p>
                </div>
              )}
              {record.toWarehouseId && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">To</p>
                  <p className="text-white">{whName(record.toWarehouseId)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-yellow-900/10 border border-yellow-600/20 rounded-xl p-4 mb-6 flex gap-3">
          <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-yellow-300/80 text-sm">
            Movement type, quantity, SKU, and warehouse assignments are locked after recording.
            To correct a mistake, record an offsetting movement.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Read-only product/SKU display */}
          {record && (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
                Movement Details (locked)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FL>SKU ID</FL>
                  <div className={`${INPUT_READONLY} font-mono`}>{record.skuId ?? "—"}</div>
                </div>
                <div>
                  <FL>Quantity</FL>
                  <div className={`${INPUT_READONLY} font-mono`}>{record.quantity}</div>
                </div>
              </div>
            </div>
          )}

          {/* Editable fields */}
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
                placeholder="Additional context, reason for adjustment, delivery notes..."
                className={`${INPUT} resize-none`} />
            </div>
          </div>

          <div className="flex gap-4 justify-end pb-6">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all">
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
