"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createWarehouse, getWarehouseById, updateWarehouse } from "@/services/Inventory";

const WAREHOUSE_TYPES = [
  "Main Warehouse",
  "Site Storage",
  "Transit Hub",
  "Cold Storage",
  "Secure Storage",
  "Distribution Center",
  "Other",
];

const CAPACITY_UNITS = ["pallets", "sqft", "m²", "m³", "units", "tonnes"];

const TYPE_ICON = {
  "Main Warehouse": "🏭",
  "Site Storage": "🏗️",
  "Transit Hub": "🚛",
  "Cold Storage": "❄️",
  "Secure Storage": "🔒",
  "Distribution Center": "📦",
  "Other": "🏢",
};

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-red-400 ml-1">*</span>}
  </label>
);
const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

const EMPTY_FORM = {
  name: "",
  code: "",
  type: "Main Warehouse",
  location: "",
  city: "",
  country: "",
  manager_name: "",
  manager_email: "",
  capacity: "",
  capacity_unit: "pallets",
  status: "active",
  notes: "",
};

export default function WarehousesAdd({ editId }) {
  const router = useRouter();
  const params = useParams()
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFL] = useState(!!editId);
  const [msg, setMsg] = useState(null);
  const isEdit = !!params?.id;

  // Load existing data when editing
  useEffect(() => {
    if (!editId) return;
    setFL(true);
    getWarehouseById(editId)
      .then((res) => {
        const d = res?.data || res;
        setForm({
          name: d.name || "",
          code: d.code || "",
          type: d.type || "Main Warehouse",
          location: d.location || "",
          city: d.city || "",
          country: d.country || "",
          manager_name: d.manager_name || "",
          manager_email: d.manager_email || "",
          capacity: d.capacity || "",
          capacity_unit: d.capacity_unit || "pallets",
          status: d.status || "active",
          notes: d.notes || "",
        });
      })
      .catch(() => setMsg({ type: "error", text: "Failed to load warehouse data" }))
      .finally(() => setFL(false));
  }, [editId]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((f) => ({ ...f, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Warehouse name is required";
    if (!form.type) e.type = "Warehouse type is required";
    if (form.capacity && isNaN(form.capacity)) e.capacity = "Capacity must be a number";
    if (form.manager_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.manager_email))
      e.manager_email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null,
      };
      if (isEdit) {
        await updateWarehouse(editId, payload);
        setMsg({ type: "success", text: "Warehouse updated successfully" });
      } else {
        await createWarehouse(payload);
        setMsg({ type: "success", text: "Warehouse created successfully" });
      }
      setTimeout(() => router.push("/Inventory/Warehouses/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to save warehouse" });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {msg && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${msg.type === "success"
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
          Back to Warehouses
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">
          {isEdit ? "Edit Warehouse" : "Add Warehouse"}
        </h1>
        <p className="text-gray-400 mb-8">
          {isEdit
            ? "Update warehouse details, capacity, and manager information."
            : "Create a new warehouse location for tracking inventory stock."}
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Type Selector */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Warehouse Type <span className="text-red-400">*</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {WAREHOUSE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setForm((f) => ({ ...f, type: t })); if (errors.type) setErrors((e) => ({ ...e, type: "" })); }}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${form.type === t
                      ? "border-cyan-500 bg-cyan-900/20 text-white"
                      : "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                    }`}
                >
                  <div className="text-2xl mb-1">{TYPE_ICON[t]}</div>
                  <p className="text-xs font-medium leading-tight">{t}</p>
                </button>
              ))}
            </div>
            <Err msg={errors.type} />
          </div>

          {/* Basic Info */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Basic Information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Warehouse Name</FL>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Main Site Warehouse"
                  className={`${INPUT} ${errors.name ? "border-red-500" : ""}`}
                />
                <Err msg={errors.name} />
              </div>

              <div>
                <FL>Warehouse Code</FL>
                <input
                  type="text"
                  value={form.code}
                  onChange={set("code")}
                  placeholder="e.g. WH-01"
                  className={`${INPUT} font-mono uppercase`}
                  onBlur={() => setForm((f) => ({ ...f, code: f.code.toUpperCase() }))}
                />
                <p className="text-gray-600 text-xs mt-1">Short identifier used in reports and labels</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>

            <div>
              <FL>Address / Location Description</FL>
              <input
                type="text"
                value={form.location}
                onChange={set("location")}
                placeholder="e.g. Building 3, Zone A, North Gate"
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>City</FL>
                <input
                  type="text"
                  value={form.city}
                  onChange={set("city")}
                  placeholder="e.g. Houston"
                  className={INPUT}
                />
              </div>
              <div>
                <FL>Country</FL>
                <input
                  type="text"
                  value={form.country}
                  onChange={set("country")}
                  placeholder="e.g. United States"
                  className={INPUT}
                />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Capacity</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Total Capacity</FL>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.capacity}
                  onChange={set("capacity")}
                  placeholder="e.g. 500"
                  className={`${INPUT} ${errors.capacity ? "border-red-500" : ""}`}
                />
                <Err msg={errors.capacity} />
              </div>
              <div>
                <FL>Capacity Unit</FL>
                <select value={form.capacity_unit} onChange={set("capacity_unit")} className={INPUT}>
                  {CAPACITY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <p className="text-gray-600 text-xs">
              Used to calculate utilization percentage on the warehouse card. Leave blank if not tracking capacity.
            </p>
          </div>

          {/* Manager */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manager</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Manager Name</FL>
                <input
                  type="text"
                  value={form.manager_name}
                  onChange={set("manager_name")}
                  placeholder="e.g. John Smith"
                  className={INPUT}
                />
              </div>
              <div>
                <FL>Manager Email</FL>
                <input
                  type="email"
                  value={form.manager_email}
                  onChange={set("manager_email")}
                  placeholder="manager@company.com"
                  className={`${INPUT} ${errors.manager_email ? "border-red-500" : ""}`}
                />
                <Err msg={errors.manager_email} />
              </div>
            </div>
          </div>

          {/* Notes & Status */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Additional Details</p>

            <div>
              <FL>Notes</FL>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Operating hours, access instructions, special requirements..."
                className={`${INPUT} resize-none`}
              />
            </div>

            {/* Status toggle */}
            <div className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${form.status === "active"
                ? "bg-green-900/20 border-green-500/30"
                : "bg-gray-800/40 border-gray-700"
              }`}>
              <input
                id="wh-status"
                type="checkbox"
                checked={form.status === "active"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "active" : "inactive" }))}
                className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
              />
              <label htmlFor="wh-status" className="cursor-pointer">
                <p className={`text-sm font-medium ${form.status === "active" ? "text-green-300" : "text-gray-400"}`}>
                  {form.status === "active"
                    ? "Active — available for stock movements"
                    : "Inactive — excluded from movement selections"}
                </p>
              </label>
            </div>
          </div>

          {/* Live Preview */}
          {form.name && (
            <div className="bg-gray-900/50 rounded-xl border border-cyan-500/20 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preview</p>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{TYPE_ICON[form.type] || "🏢"}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{form.name}</p>
                    {form.code && (
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">
                        {form.code}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{form.type}</p>
                  {(form.city || form.location) && (
                    <p className="text-gray-500 text-xs">
                      {[form.location, form.city, form.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {form.capacity && (
                    <p className="text-gray-500 text-xs">Capacity: {form.capacity} {form.capacity_unit}</p>
                  )}
                </div>
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
              disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Warehouse" : "Create Warehouse")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
