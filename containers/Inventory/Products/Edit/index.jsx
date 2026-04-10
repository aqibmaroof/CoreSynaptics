"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProductById, updateProduct } from "@/services/Inventory";

const CATEGORIES = ["Electrical", "Mechanical", "Civil", "IT Equipment", "Safety", "Tools", "Consumables", "Spare Parts", "Other"];
const UNIT_TYPES  = ["pcs", "kg", "box", "set", "m", "L", "roll", "pallet"];

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-red-400 ml-1">*</span>}
  </label>
);

export default function ProductEdit({ editId }) {
  const router = useRouter();

  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg]             = useState(null);
  const [errors, setErrors]       = useState({});

  const [form, setForm] = useState({
    name: "", description: "", category: "", brand: "",
    unit_type: "pcs", barcode: "", status: "active",
  });

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    getProductById(editId)
      .then((res) => {
        const d = res?.data ?? res;
        setForm({
          name:        d.name        ?? "",
          description: d.description ?? "",
          category:    d.category    ?? "",
          brand:       d.brand       ?? "",
          unit_type:   d.unit_type   ?? "pcs",
          barcode:     d.barcode     ?? "",
          status:      d.status      ?? "active",
        });
      })
      .catch(() => setFetchError("Failed to load product. It may have been deleted."))
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

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name     = "Product name is required";
    if (!form.category)     e.category = "Category is required";
    if (!form.unit_type)    e.unit_type = "Unit type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await updateProduct(editId, form);
      setMsg({ type: "success", text: "Product updated successfully" });
      setTimeout(() => router.push("/Inventory/Products/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to update product" });
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
          Loading product...
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
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
            msg.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>{msg.text}</div>
        )}

        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Edit Product</h1>
        <p className="text-gray-400 mb-8">Update product master record details.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">

            <div>
              <FL required>Product Name</FL>
              <input type="text" value={form.name} onChange={set("name")} placeholder="e.g. UPS Battery Module 1500VA"
                className={`${INPUT} ${errors.name ? "border-red-500" : ""}`} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <FL>Description</FL>
              <textarea value={form.description} onChange={set("description")} rows={3}
                placeholder="Detailed product description, specifications..."
                className={`${INPUT} resize-none`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Category</FL>
                <select value={form.category} onChange={set("category")}
                  className={`${INPUT} ${errors.category ? "border-red-500" : ""}`}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <FL>Brand / Manufacturer</FL>
                <input type="text" value={form.brand} onChange={set("brand")} placeholder="e.g. Schneider Electric"
                  className={INPUT} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Unit Type</FL>
                <select value={form.unit_type} onChange={set("unit_type")}
                  className={`${INPUT} ${errors.unit_type ? "border-red-500" : ""}`}>
                  {UNIT_TYPES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <FL>Barcode / Part Number</FL>
                <input type="text" value={form.barcode} onChange={set("barcode")} placeholder="Scan or type barcode"
                  className={`${INPUT} font-mono`} />
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
              form.status === "active" ? "bg-green-900/20 border-green-500/30" : "bg-gray-800/40 border-gray-700"
            }`}>
              <input id="status" type="checkbox" checked={form.status === "active"}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.checked ? "active" : "inactive" }))}
                className="w-4 h-4 rounded accent-cyan-500 cursor-pointer" />
              <label htmlFor="status" className="cursor-pointer">
                <p className={`text-sm font-medium ${form.status === "active" ? "text-green-300" : "text-gray-400"}`}>
                  {form.status === "active" ? "Active — visible in inventory" : "Inactive — hidden from stock"}
                </p>
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-6 justify-end">
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
