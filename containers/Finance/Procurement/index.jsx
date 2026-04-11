"use client";
import { useState, useEffect } from "react";
import {
  getProcurementItems,
  createProcurementItem,
  updateProcurementItem,
  deleteProcurementItem,
  logVendorDelay,
  getProcurementDelays,
  resolveProcurementDelay,
} from "@/services/Finance/Procurement";
import { formatCurrency } from "@/Utils/payrollCalculations";

const PROC_STATUSES = ["Planned", "Ordered", "In Transit", "Received", "Delayed", "Cancelled"];
const STATUS_BADGE = {
  Planned: "badge-ghost",
  Ordered: "badge-info",
  "In Transit": "badge-warning",
  Received: "badge-success",
  Delayed: "badge-error",
  Cancelled: "badge-neutral",
};

const IMPACT_LEVELS = ["Low", "Medium", "High", "Critical"];
const IMPACT_COLOR = {
  Low: "badge-success",
  Medium: "badge-warning",
  High: "badge-error",
  Critical: "badge-error",
};

const EMPTY_FORM = {
  material_name: "",
  vendor_id: "",
  vendor_name: "",
  project_id: "",
  task_id: "",
  quantity: "",
  unit: "units",
  unit_cost: "",
  expected_delivery: "",
  status: "Planned",
  notes: "",
};

const EMPTY_DELAY = {
  reason: "",
  original_delivery: "",
  revised_delivery: "",
  impact_level: "Medium",
  impact_description: "",
};

export default function ProcurementDelays() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delay modal
  const [delayTarget, setDelayTarget] = useState(null);
  const [delays, setDelays] = useState([]);
  const [delayForm, setDelayForm] = useState(EMPTY_DELAY);
  const [loggingDelay, setLoggingDelay] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await getProcurementItems();
      setItems(res?.data?.items || res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function openDelays(item) {
    setDelayTarget(item);
    try {
      const res = await getProcurementDelays(item.id);
      setDelays(res?.data || []);
    } catch (e) { setDelays([]); }
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      material_name: item.material_name || "",
      vendor_id: item.vendor_id || "",
      vendor_name: item.vendor_name || "",
      project_id: item.project_id || "",
      task_id: item.task_id || "",
      quantity: item.quantity || "",
      unit: item.unit || "units",
      unit_cost: item.unit_cost || "",
      expected_delivery: item.expected_delivery?.slice(0, 10) || "",
      status: item.status || "Planned",
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
        unit_cost: parseFloat(form.unit_cost) || 0,
      };
      if (editing) await updateProcurementItem(editing.id, payload);
      else await createProcurementItem(payload);
      setShowModal(false);
      fetchItems();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProcurementItem(deleteTarget.id);
      setDeleteTarget(null);
      fetchItems();
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const handleLogDelay = async () => {
    setLoggingDelay(true);
    try {
      await logVendorDelay(delayTarget.id, delayForm);
      const res = await getProcurementDelays(delayTarget.id);
      setDelays(res?.data || []);
      setDelayForm(EMPTY_DELAY);
      fetchItems();
    } catch (e) { console.error(e); }
    finally { setLoggingDelay(false); }
  };

  const handleResolveDelay = async (delayId) => {
    try {
      await resolveProcurementDelay(delayTarget.id, delayId, { resolved: true });
      setDelays((prev) => prev.map((d) => d.id === delayId ? { ...d, resolved: true } : d));
    } catch (e) { console.error(e); }
  };

  const filtered = items.filter((item) => {
    const ms = !search ||
      item.material_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.vendor_name?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || item.status === statusFilter;
    return ms && mf;
  });

  const isOverdue = (item) =>
    item.status !== "Received" && item.expected_delivery &&
    new Date(item.expected_delivery) < new Date();

  const totalValue = (item) => (item.quantity || 0) * (item.unit_cost || 0);

  const summary = {
    total: items.length,
    delayed: items.filter((i) => i.status === "Delayed" || isOverdue(i)).length,
    inTransit: items.filter((i) => i.status === "In Transit").length,
    received: items.filter((i) => i.status === "Received").length,
    totalSpend: items.reduce((s, i) => s + totalValue(i), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Procurement & Delays</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Material procurement tracking, vendor delays, and project timeline impact
          </p>
        </div>
        <button className="btn btn-sm btn-info" onClick={openAdd}>+ Add Procurement</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Items", value: summary.total, color: "text-info" },
          { label: "Delayed", value: summary.delayed, color: "text-error" },
          { label: "In Transit", value: summary.inTransit, color: "text-warning" },
          { label: "Received", value: summary.received, color: "text-success" },
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
        <input type="text" placeholder="Search materials or vendors..."
          className="input input-sm input-bordered bg-slate-700 text-gray-100 w-64"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {["All", ...PROC_STATUSES].map((s) => (
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
                  <th>Material</th>
                  <th>Vendor</th>
                  <th>Project / Task</th>
                  <th>Qty</th>
                  <th>Unit Cost</th>
                  <th>Total Value</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const overdue = isOverdue(item);
                  return (
                    <tr key={item.id} className={`hover:bg-slate-700 ${overdue ? "border-l-2 border-error" : ""}`}>
                      <td>
                        <div className="text-gray-100 font-medium">{item.material_name}</div>
                        {item.delay_count > 0 && (
                          <span className="badge badge-error badge-xs">{item.delay_count} delay(s)</span>
                        )}
                      </td>
                      <td className="text-gray-300 text-sm">{item.vendor_name || "—"}</td>
                      <td>
                        <div className="text-gray-300 text-xs">{item.project_name || item.project_id || "—"}</div>
                        {item.task_id && <div className="text-gray-500 text-xs">Task: {item.task_id}</div>}
                      </td>
                      <td className="text-gray-100">{item.quantity} {item.unit}</td>
                      <td className="text-gray-100">{formatCurrency(item.unit_cost)}</td>
                      <td className="text-gray-100 font-medium">{formatCurrency(totalValue(item))}</td>
                      <td>
                        <span className={`text-xs ${overdue ? "text-error font-medium" : "text-gray-400"}`}>
                          {item.expected_delivery
                            ? new Date(item.expected_delivery).toLocaleDateString()
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
                        <div className="flex gap-1">
                          <button className="btn btn-xs btn-ghost text-error"
                            onClick={() => openDelays(item)}>
                            {item.delay_count > 0 ? `Delays (${item.delay_count})` : "Log Delay"}
                          </button>
                          <button className="btn btn-xs btn-ghost text-gray-100"
                            onClick={() => openEdit(item)}>Edit</button>
                          <button className="btn btn-xs btn-ghost text-error"
                            onClick={() => setDeleteTarget(item)}>Del</button>
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

      {/* Delay Modal */}
      {delayTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <h3 className="font-bold text-lg text-gray-100 mb-1">
              Vendor Delays — {delayTarget.material_name}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {delayTarget.vendor_name} · {delayTarget.project_name || delayTarget.project_id}
            </p>

            {/* Existing delays */}
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {delays.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-2">No delays logged.</p>
              ) : delays.map((d) => (
                <div key={d.id} className={`bg-slate-700 rounded-lg px-3 py-2 ${d.resolved ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge badge-xs ${IMPACT_COLOR[d.impact_level]}`}>{d.impact_level}</span>
                        {d.resolved && <span className="badge badge-xs badge-success">Resolved</span>}
                      </div>
                      <p className="text-gray-100 text-sm">{d.reason}</p>
                      {d.impact_description && (
                        <p className="text-xs text-gray-400 mt-1">{d.impact_description}</p>
                      )}
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>Original: {d.original_delivery ? new Date(d.original_delivery).toLocaleDateString() : "—"}</span>
                        <span>Revised: {d.revised_delivery ? new Date(d.revised_delivery).toLocaleDateString() : "—"}</span>
                      </div>
                    </div>
                    {!d.resolved && (
                      <button className="btn btn-xs btn-success ml-2 flex-shrink-0"
                        onClick={() => handleResolveDelay(d.id)}>Resolve</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Log delay form */}
            <div className="border-t border-slate-700 pt-4 space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Log New Delay</p>
              <textarea placeholder="Reason for delay..." rows={2}
                className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm"
                value={delayForm.reason}
                onChange={(e) => setDelayForm({ ...delayForm, reason: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs text-gray-400">Original Delivery</label>
                  <input type="date" className="input input-xs input-bordered w-full bg-slate-700 text-gray-100"
                    value={delayForm.original_delivery}
                    onChange={(e) => setDelayForm({ ...delayForm, original_delivery: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Revised Delivery</label>
                  <input type="date" className="input input-xs input-bordered w-full bg-slate-700 text-gray-100"
                    value={delayForm.revised_delivery}
                    onChange={(e) => setDelayForm({ ...delayForm, revised_delivery: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Impact Level</label>
                <select className="select select-xs select-bordered w-full bg-slate-700 text-gray-100"
                  value={delayForm.impact_level}
                  onChange={(e) => setDelayForm({ ...delayForm, impact_level: e.target.value })}>
                  {IMPACT_LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <textarea placeholder="Impact on project timeline (optional)..." rows={2}
                className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm"
                value={delayForm.impact_description}
                onChange={(e) => setDelayForm({ ...delayForm, impact_description: e.target.value })} />
              <button className="btn btn-xs btn-error w-full"
                onClick={handleLogDelay}
                disabled={loggingDelay || !delayForm.reason}>
                {loggingDelay ? "Logging..." : "Log Delay"}
              </button>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setDelayTarget(null)}>Done</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDelayTarget(null)} />
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
                <label className="label text-xs text-gray-400">Material / Item Name</label>
                <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.material_name}
                  onChange={(e) => setForm({ ...form, material_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Vendor Name</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.vendor_name}
                    onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Vendor ID (optional)</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.vendor_id}
                    onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Project ID</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.project_id}
                    onChange={(e) => setForm({ ...form, project_id: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Task ID (optional)</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.task_id}
                    onChange={(e) => setForm({ ...form, task_id: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Quantity</label>
                  <input type="number" min="0" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Unit</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    placeholder="units, kg, m..."
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Unit Cost ($)</label>
                  <input type="number" min="0" step="0.01" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.unit_cost}
                    onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Expected Delivery</label>
                  <input type="date" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.expected_delivery}
                    onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Status</label>
                  <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {PROC_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {form.quantity && form.unit_cost && (
                <div className="bg-slate-700 rounded-lg px-3 py-2 text-sm text-gray-100">
                  Total Value: <strong>{formatCurrency(parseFloat(form.quantity) * parseFloat(form.unit_cost))}</strong>
                </div>
              )}
              <div>
                <label className="label text-xs text-gray-400">Notes</label>
                <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-info btn-sm" onClick={handleSave}
                disabled={saving || !form.material_name}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">Delete Procurement Item?</h3>
            <p className="text-sm text-gray-400 mt-2">
              Delete <strong className="text-gray-100">{deleteTarget.material_name}</strong>?
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-error btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} />
        </div>
      )}
    </div>
  );
}
