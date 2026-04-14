"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createWarehouse, getWarehouseById, updateWarehouse } from "@/services/Inventory";

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-red-400 ml-1">*</span>}
  </label>
);
const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

const EMPTY_FORM = {
  name: "", code: "", address: "", city: "", country: "", contactName: "", contactPhone: "",
};

export default function WarehousesAdd({ editId }) {
  const router = useRouter();
  const params = useParams();
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [fetchLoading, setFL]   = useState(!!editId);
  const [msg, setMsg]           = useState(null);
  const isEdit = !!params?.id;

  useEffect(() => {
    if (!editId) return;
    setFL(true);
    getWarehouseById(editId)
      .then((res) => {
        const d = res?.data || res;
        setForm({
          name:         d.name         || "",
          code:         d.code         || "",
          address:      d.address      || "",
          city:         d.city         || "",
          country:      d.country      || "",
          contactName:  d.contactName  || "",
          contactPhone: d.contactPhone || "",
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
    if (!isEdit && !form.code.trim()) e.code = "Warehouse code is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name:         form.name,
        address:      form.address      || undefined,
        city:         form.city         || undefined,
        country:      form.country      || undefined,
        contactName:  form.contactName  || undefined,
        contactPhone: form.contactPhone || undefined,
      };
      // code is immutable after creation — only include on create
      if (!isEdit) payload.code = form.code;

      if (isEdit) {
        await updateWarehouse(editId, payload);
        setMsg({ type: "success", text: "Warehouse updated successfully" });
      } else {
        await createWarehouse(payload);
        setMsg({ type: "success", text: "Warehouse created successfully" });
      }
      setTimeout(() => router.push("/Inventory/Warehouses/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || err?.message || "Failed to save warehouse" });
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
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
            msg.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>
            {msg.text}
          </div>
        )}

        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
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
            ? "Update warehouse details and contact information."
            : "Create a new warehouse location for tracking inventory stock."}
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Basic Info */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Basic Information
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Warehouse Name</FL>
                <input type="text" value={form.name} onChange={set("name")}
                  placeholder="e.g. Main Warehouse - Dubai"
                  className={`${INPUT} ${errors.name ? "border-red-500" : ""}`} />
                <Err msg={errors.name} />
              </div>

              <div>
                <FL required={!isEdit}>Warehouse Code</FL>
                <input type="text" value={form.code}
                  onChange={isEdit ? undefined : set("code")}
                  readOnly={isEdit}
                  placeholder="e.g. WH-001"
                  className={`${INPUT} font-mono uppercase ${isEdit ? "opacity-50 cursor-not-allowed" : ""} ${errors.code ? "border-red-500" : ""}`}
                  onBlur={!isEdit ? () => setForm((f) => ({ ...f, code: f.code.toUpperCase() })) : undefined} />
                {isEdit
                  ? <p className="text-gray-600 text-xs mt-1">Warehouse code cannot be changed after creation</p>
                  : <p className="text-gray-600 text-xs mt-1">Unique identifier — cannot be changed after creation</p>
                }
                <Err msg={errors.code} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Location
            </p>

            <div>
              <FL>Address</FL>
              <input type="text" value={form.address} onChange={set("address")}
                placeholder="e.g. 123 Industrial Blvd, Zone A" className={INPUT} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>City</FL>
                <input type="text" value={form.city} onChange={set("city")}
                  placeholder="e.g. Dubai" className={INPUT} />
              </div>
              <div>
                <FL>Country</FL>
                <input type="text" value={form.country} onChange={set("country")}
                  placeholder="e.g. UAE" className={INPUT} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Contact
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Contact Name</FL>
                <input type="text" value={form.contactName} onChange={set("contactName")}
                  placeholder="e.g. Ahmed Al-Rashid" className={INPUT} />
              </div>
              <div>
                <FL>Contact Phone</FL>
                <input type="tel" value={form.contactPhone} onChange={set("contactPhone")}
                  placeholder="+971-50-123-4567" className={INPUT} />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          {form.name && (
            <div className="bg-gray-900/50 rounded-xl border border-cyan-500/20 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preview</p>
              <div className="flex items-center gap-4">
                <span className="text-4xl">🏭</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{form.name}</p>
                    {form.code && (
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">
                        {form.code}
                      </span>
                    )}
                  </div>
                  {(form.city || form.address) && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      {[form.address, form.city, form.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {form.contactName && (
                    <p className="text-gray-500 text-xs mt-0.5">Contact: {form.contactName}{form.contactPhone ? ` · ${form.contactPhone}` : ""}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
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
              {loading
                ? (isEdit ? "Updating..." : "Creating...")
                : (isEdit ? "Update Warehouse" : "Create Warehouse")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
