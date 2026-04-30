"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAsset } from "@/services/AssetManagement";

const CATEGORIES = [
  "IT Equipment",
  "Vehicle",
  "Machinery",
  "Furniture",
  "Safety Equipment",
  "Tools",
  "Other",
];

// Only these categories carry a meaningful warranty period
const WARRANTY_CATEGORIES = new Set([
  "IT Equipment",
  "Vehicle",
  "Machinery",
  "Safety Equipment",
]);

const INPUT =
  "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required, hint }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {hint && <p className="text-gray-600 text-xs mb-1">{hint}</p>}
  </div>
);

export default function AssetAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    assetTag: "",
    name: "",
    category: "",
    procurementType: "",
    purchaseDate: "",
    purchaseCost: "",
    currentValue: "",
    warrantyExpiry: "",
    notes: "",
  });

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const showWarranty = WARRANTY_CATEGORIES.has(form.category);

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((p) => ({
      ...p,
      [k]: value,
      // Clear warranty expiry when switching to a category that doesn't support it
      ...(k === "category" && !WARRANTY_CATEGORIES.has(value)
        ? { warrantyExpiry: "" }
        : {}),
    }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.assetTag.trim())
      e.assetTag = "Asset tag is required and must be unique";
    if (!form.name.trim()) e.name = "Asset name is required";
    if (!form.category) e.category = "Category is required";
    if (!form.procurementType) e.procurementType = "ProcurementType is required.";
    else if (!["CFCI", "OFCI"].includes(form.procurementType))
      e.procurementType = "ProcurementType must be one of: CFCI, OFCI.";
    if (form.purchaseCost && isNaN(Number(form.purchaseCost)))
      e.purchaseCost = "Must be a valid number";
    if (form.currentValue && isNaN(Number(form.currentValue)))
      e.currentValue = "Must be a valid number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createAsset({
        assetTag: form.assetTag,
        name: form.name,
        category: form.category,
        procurementType: form.procurementType,
        purchaseDate: form.purchaseDate || undefined,
        purchaseCost: form.purchaseCost
          ? parseFloat(form.purchaseCost)
          : undefined,
        currentValue: form.currentValue
          ? parseFloat(form.currentValue)
          : undefined,
        warrantyExpiry: showWarranty && form.warrantyExpiry ? form.warrantyExpiry : undefined,
        notes: form.notes || undefined,
      });
      setMsg({
        type: "success",
        text: "Asset registered — initial status: IN_STOCK",
      });
      setTimeout(() => router.push("/Assets/List"), 1500);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.message || "Failed to register asset",
      });
    } finally {
      setLoading(false);
    }
  };

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
          Back to Assets
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Register Asset
            </h1>
            <p className="text-gray-400 mb-8">
              All new assets start as{" "}
              <span className="text-green-400 font-medium">IN_STOCK</span>. Use
              the list page to assign, send for repair, or retire.
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

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* ── Identity ─────────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
              Asset Identity
            </h2>

            <div>
              <FL required>Asset Tag</FL>
              <input
                type="text"
                value={form.assetTag}
                onChange={set("assetTag")}
                placeholder="e.g. IT-LAP-0042"
                className={`${INPUT} font-mono ${errors.assetTag ? "border-red-500" : ""}`}
              />
              {errors.assetTag && (
                <p className="text-red-400 text-xs mt-1">{errors.assetTag}</p>
              )}
            </div>

            <div>
              <FL required>Asset Name</FL>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Dell Latitude 5540 Laptop"
                className={`${INPUT} ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <FL required>Category</FL>
              <select
                value={form.category}
                onChange={set("category")}
                className={`${INPUT} ${errors.category ? "border-red-500" : ""}`}
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-400 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <FL required>Procurement Type</FL>
              <div className="flex gap-3 mt-1">
                {["CFCI", "OFCI"].map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, procurementType: pt }));
                      if (errors.procurementType)
                        setErrors((p) => ({ ...p, procurementType: "" }));
                    }}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-mono font-medium transition-colors ${
                      form.procurementType === pt
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                        : "border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {pt}
                    <span className="block text-[10px] font-sans font-normal mt-0.5 opacity-70">
                      {pt === "CFCI" ? "Contractor Furnished & Installed" : "Owner Furnished & Contractor Installed"}
                    </span>
                  </button>
                ))}
              </div>
              {errors.procurementType && (
                <p className="text-red-400 text-xs mt-1">{errors.procurementType}</p>
              )}
            </div>
          </section>

          {/* ── Financials ───────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
              Purchase & Value
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <FL>Purchase Date</FL>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={set("purchaseDate")}
                  className={INPUT}
                />
              </div>
              <div>
                <FL>Purchase Cost ($)</FL>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.purchaseCost}
                  onChange={set("purchaseCost")}
                  placeholder="0.00"
                  className={`${INPUT} font-mono ${errors.purchaseCost ? "border-red-500" : ""}`}
                />
                {errors.purchaseCost && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.purchaseCost}
                  </p>
                )}
              </div>
              <div>
                <FL>Current Value ($)</FL>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.currentValue}
                  onChange={set("currentValue")}
                  placeholder="0.00"
                  className={`${INPUT} font-mono ${errors.currentValue ? "border-red-500" : ""}`}
                />
                {errors.currentValue && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.currentValue}
                  </p>
                )}
              </div>
            </div>

            {showWarranty && (
              <div>
                <FL>Warranty Expiry</FL>
                <input
                  type="date"
                  value={form.warrantyExpiry}
                  onChange={set("warrantyExpiry")}
                  className={INPUT}
                />
                <p className="text-gray-600 text-xs mt-1">
                  Assets expiring within 30 days are flagged with a warning
                </p>
              </div>
            )}
          </section>

          {/* ── Notes ───────────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <FL>Notes</FL>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              placeholder="Condition notes, configuration details, accessories..."
              className={`${INPUT} resize-none`}
            />
          </section>

          <div className="flex gap-4 justify-end">
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
              {loading ? "Registering..." : "Register Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
