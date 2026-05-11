"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, updateProduct } from "@/services/Inventory";

const CATEGORIES = [
  "Electrical",
  "Mechanical",
  "Civil",
  "IT Equipment",
  "Safety",
  "Tools",
  "Consumables",
  "Spare Parts",
  "Hardware",
  "Other",
];
const UNITS = ["pcs", "kg", "box", "set", "m", "L", "roll", "pallet"];

const INPUT =
  "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}
    {required && <span className="text-red-400 ml-1">*</span>}
  </label>
);

export default function ProductEdit() {
  const router = useRouter();
  const params = useParams();
  const editId = params.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    unit: "pcs",
    quantity: "",
  });

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    getProductById(editId)
      .then((res) => {
        const d = res?.data ?? res;
        setForm({
          name: d.name ?? "",
          description: d.description ?? "",
          category: d.category ?? "",
          brand: d.brand ?? "",
          unit: d.unit ?? "pcs",
          quantity: d.quantity ?? "",
        });
      })
      .catch(() =>
        setFetchError("Failed to load product. It may have been deleted."),
      )
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
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.unit) e.unit = "Unit is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await updateProduct(editId, {
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        brand: form.brand || undefined,
        unit: form.unit,
        quantity: form.quantity,
      });
      setMsg({ type: "success", text: "Product updated successfully" });
      setTimeout(() => router.push("/Inventory/Products/List"), 1500);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.message || "Failed to update product",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
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
          <button
            onClick={() => router.back()}
            className="text-cyan-400 hover:text-cyan-300 text-sm underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Products
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Edit Product</h1>
            <p className="text-gray-400 mb-8">
              Update product master record details.
            </p>
          </div>
          {msg && (
            <div
              className={`z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
                msg.type === "success"
                  ? "bg-green-900/80 border-green-500/30 text-green-300"
                  : "bg-red-900/80 border-red-500/30 text-red-300"
              }`}
            >
              {msg.text}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <div>
              <FL required>Product Name</FL>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Server Rack Unit 42U"
                className={`${INPUT} ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <FL required>Product Quantity</FL>
              <input
                type="text"
                value={form.quantity}
                onChange={set("quantity")}
                placeholder="e.g. 10"
                className={`${INPUT} ${errors.quantity ? "border-red-500" : ""}`}
              />
              {errors.quantity && (
                <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <FL>Description</FL>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                placeholder="Detailed product description, specifications..."
                className={`${INPUT} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Category</FL>
                <select
                  value={form.category}
                  onChange={set("category")}
                  className={INPUT}
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FL>Brand / Manufacturer</FL>
                <input
                  type="text"
                  value={form.brand}
                  onChange={set("brand")}
                  placeholder="e.g. Dell, Schneider Electric"
                  className={INPUT}
                />
              </div>
            </div>

            <div className="md:w-1/3">
              <FL required>Unit</FL>
              <select
                value={form.unit}
                onChange={set("unit")}
                className={`${INPUT} ${errors.unit ? "border-red-500" : ""}`}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="text-red-400 text-xs mt-1">{errors.unit}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
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
