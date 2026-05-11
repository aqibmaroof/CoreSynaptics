"use client";
import { useState, useEffect } from "react";
import {
  getProcurementItems,
  createProcurementItem,
  updateProcurementItem,
  orderProcurementItem,
  markProcurementDelayed,
  markProcurementDelivered,
} from "@/services/Finance/Procurement";
import { formatCurrency } from "@/Utils/payrollCalculations";

const STATUS_BADGE = {
  PLANNED: "badge-ghost",
  ORDERED: "badge-info",
  DELAYED: "badge-error",
  DELIVERED: "badge-success",
};

const EMPTY_FORM = {
  name: "",
  vendorId: "",
  vendorName: "",
  projectId: "",
  taskId: "",
  vendorQuoteId: "",
  quantity: "",
  unit: "",
  unitCost: "",
  expectedDelivery: "",
  notes: "",
};

export default function Procurement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delay reason modal
  const [delayTarget, setDelayTarget] = useState(null);
  const [delayReason, setDelayReason] = useState("");
  const [delaying, setDelaying] = useState(false);

  // Generic action loading tracker (order / deliver)
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await getProcurementItems();
      setItems(res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      vendorId: item.vendorId || "",
      vendorName: item.vendorName || "",
      projectId: item.projectId || "",
      taskId: item.taskId || "",
      vendorQuoteId: item.vendorQuoteId || "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      unitCost: item.unitCost || "",
      expectedDelivery: item.expectedDelivery?.slice(0, 10) || "",
      notes: item.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: parseFloat(form.quantity) || 0,
        unitCost: parseFloat(form.unitCost) || 0,
        expectedDelivery: form.expectedDelivery
          ? new Date(form.expectedDelivery).toISOString()
          : undefined,
      };
      if (!payload.taskId) delete payload.taskId;
      if (!payload.vendorQuoteId) delete payload.vendorQuoteId;
      if (!payload.unit) delete payload.unit;
      if (!payload.expectedDelivery) delete payload.expectedDelivery;
      if (editing) await updateProcurementItem(editing.id, payload);
      else await createProcurementItem(payload);
      setShowModal(false);
      fetchItems();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleOrder = async (id) => {
    setActioningId(id);
    try {
      await orderProcurementItem(id);
      fetchItems();
    } catch (e) { console.error(e); }
    finally { setActioningId(null); }
  };

  const handleDeliver = async (id) => {
    setActioningId(id);
    try {
      await markProcurementDelivered(id);
      fetchItems();
    } catch (e) { console.error(e); }
    finally { setActioningId(null); }
  };

  const handleDelay = async () => {
    setDelaying(true);
    try {
      await markProcurementDelayed(delayTarget.id, { delayReason });
      setDelayTarget(null);
      setDelayReason("");
      fetchItems();
    } catch (e) { console.error(e); }
    finally { setDelaying(false); }
  };

  const filtered = items.filter((item) => {
    const ms = !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.vendorName?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || item.status === statusFilter;
    return ms && mf;
  });

  const isOverdue = (item) =>
    item.status !== "DELIVERED" && item.expectedDelivery &&
    new Date(item.expectedDelivery) < new Date();

  const summary = {
    total: items.length,
    delayed: items.filter((i) => i.status === "DELAYED").length,
    ordered: items.filter((i) => i.status === "ORDERED").length,
    delivered: items.filter((i) => i.status === "DELIVERED").length,
    totalSpend: items.reduce((s, i) => s + (i.totalCost || 0), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Procurement</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Material and service procurement tracking across projects
          </p>
        </div>
        <button className="btn btn-sm btn-info" onClick={openAdd}>+ Add Procurement</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Items", value: summary.total, color: "text-info" },
          { label: "Delayed", value: summary.delayed, color: "text-error" },
          { label: "Ordered", value: summary.ordered, color: "text-warning" },
          { label: "Delivered", value: summary.delivered, color: "text-success" },
          { label: "Total Value", value: formatCurrency(summary.totalSpend), color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl">
        <input type="text" placeholder="Search items or vendors..."
          className="input input-sm input-bordered bg-slate-700 text-gray-100 w-64"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {["All", "PLANNED", "ORDERED", "DELAYED", "DELIVERED"].map((s) => (
            <button key={s}
              className={`btn btn-sm ${statusFilter === s ? "btn-info" : "btn-ghost text-gray-100"}`}
              onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading procurement items...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-4xl mb-3">📦</p>
            <p>No procurement items found.</p>
            <button className="btn btn-sm btn-info mt-4" onClick={openAdd}>Add First Item</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th>Item</th>
                  <th>Vendor</th>
                  <th>Project / Task</th>
                  <th>Qty</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const overdue = isOverdue(item);
                  const busy = actioningId === item.id;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-700 ${overdue ? "border-l-2 border-error" : ""}`}>
                      <td>
                        <div className="text-gray-100 font-medium">{item.name}</div>
                        {item.delayReason && (
                          <div className="text-xs text-error mt-0.5 truncate max-w-40" title={item.delayReason}>
                            {item.delayReason}
                          </div>
                        )}
                      </td>
                      <td className="text-gray-300 text-sm">{item.vendorName || "—"}</td>
                      <td>
                        <div className="text-gray-300 text-xs">{item.projectId || "—"}</div>
                        {item.taskId && <div className="text-gray-500 text-xs">Task: {item.taskId}</div>}
                      </td>
                      <td className="text-gray-100">{item.quantity} {item.unit || ""}</td>
                      <td className="text-gray-100">{formatCurrency(item.unitCost)}</td>
                      <td className="text-gray-100 font-medium">{formatCurrency(item.totalCost)}</td>
                      <td>
                        <span className={`text-xs ${overdue ? "text-error font-medium" : "text-gray-400"}`}>
                          {item.expectedDelivery
                            ? new Date(item.expectedDelivery).toLocaleDateString()
                            : "—"}
                          {overdue && <span className="badge badge-error badge-xs ml-1">Late</span>}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${STATUS_BADGE[item.status] || "badge-ghost"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {(item.status === "PLANNED" || item.status === "DELAYED") && (
                            <button className="btn btn-xs btn-info" disabled={busy}
                              onClick={() => handleOrder(item.id)}>
                              {busy ? "..." : item.status === "DELAYED" ? "Re-order" : "Order"}
                            </button>
                          )}
                          {item.status === "ORDERED" && (
                            <button className="btn btn-xs btn-warning" disabled={busy}
                              onClick={() => { setDelayTarget(item); setDelayReason(""); }}>
                              Delay
                            </button>
                          )}
                          {(item.status === "ORDERED" || item.status === "DELAYED") && (
                            <button className="btn btn-xs btn-success" disabled={busy}
                              onClick={() => handleDeliver(item.id)}>
                              {busy ? "..." : "Deliver"}
                            </button>
                          )}
                          {item.status !== "DELIVERED" && (
                            <button className="btn btn-xs btn-ghost text-gray-100"
                              onClick={() => openEdit(item)}>Edit</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Delayed Modal */}
      {delayTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">Mark as Delayed</h3>
            <p className="text-sm text-gray-400 mt-2 mb-3">
              {delayTarget.name} — {delayTarget.vendorName}
            </p>
            <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={3}
              placeholder="Reason for delay (required)..."
              value={delayReason} onChange={(e) => setDelayReason(e.target.value)} />
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => { setDelayTarget(null); setDelayReason(""); }}>Cancel</button>
              <button className="btn btn-error btn-sm" onClick={handleDelay}
                disabled={delaying || !delayReason.trim()}>
                {delaying ? "Processing..." : "Confirm Delay"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => { setDelayTarget(null); setDelayReason(""); }} />
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <h3 className="font-bold text-lg text-gray-100 mb-4">
              {editing ? "Edit Procurement Item" : "Add Procurement Item"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label text-xs text-gray-400">Item / Service Name *</label>
                <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Vendor Name *</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.vendorName}
                    onChange={(e) => setForm({ ...form, vendorName: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Vendor ID *</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.vendorId}
                    onChange={(e) => setForm({ ...form, vendorId: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Project ID *</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Task ID (optional)</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.taskId}
                    onChange={(e) => setForm({ ...form, taskId: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Vendor Quote ID (optional)</label>
                <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.vendorQuoteId}
                  onChange={(e) => setForm({ ...form, vendorQuoteId: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Quantity *</label>
                  <input type="number" min="0.01" step="any"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Unit</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    placeholder="pcs, kg, m..."
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Unit Cost ($) *</label>
                  <input type="number" min="0.01" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.unitCost}
                    onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
                </div>
              </div>
              {form.quantity && form.unitCost && (
                <div className="bg-slate-700 rounded-lg px-3 py-2 text-sm text-gray-100">
                  Total Cost: <strong>{formatCurrency(parseFloat(form.quantity) * parseFloat(form.unitCost))}</strong>
                </div>
              )}
              <div>
                <label className="label text-xs text-gray-400">Expected Delivery</label>
                <input type="date" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.expectedDelivery}
                  onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} />
              </div>
              <div>
                <label className="label text-xs text-gray-400">Notes</label>
                <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-info btn-sm" onClick={handleSave}
                disabled={saving || !form.name || !form.vendorId || !form.vendorName || !form.projectId || !form.quantity || !form.unitCost}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
