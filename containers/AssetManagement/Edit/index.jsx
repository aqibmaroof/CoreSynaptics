"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssetById, updateAsset } from "@/services/AssetManagement";

const CATEGORIES = ["IT Equipment", "Vehicle", "Machinery", "Furniture", "Safety Equipment", "Tools", "Other"];

const STATUS_STYLES = {
  IN_STOCK: "bg-green-900/30 text-green-300 border-green-500/30",
  ASSIGNED: "bg-blue-900/30 text-blue-300 border-blue-500/30",
  IN_REPAIR: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
  DAMAGED: "bg-orange-900/30 text-orange-300 border-orange-500/30",
  RETIRED: "bg-gray-800/60 text-gray-400 border-gray-600/30",
  LOST: "bg-red-900/30 text-red-300 border-red-500/30",
};

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const INPUT_READONLY = "w-full px-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-gray-400 text-sm cursor-not-allowed select-none font-mono";
const FL = ({ children, required, hint }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {hint && <p className="text-gray-600 text-xs mb-1">{hint}</p>}
  </div>
);

export default function AssetEdit({ editId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [errors, setErrors] = useState({});
  const [assetStatus, setAssetStatus] = useState(null);
  const [assetTag, setAssetTag] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    serial_number: "",
    purchase_date: "",
    purchase_cost: "",
    current_value: "",
    warranty_expiry: "",
    notes: "",
  });

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    getAssetById(editId)
      .then((res) => {
        const d = res?.data ?? res;
        setAssetStatus(d.status);
        setAssetTag(d.asset_tag ?? "");
        setForm({
          name: d.name ?? "",
          category: d.category ?? "",
          serial_number: d.serial_number ?? "",
          purchase_date: d.purchase_date ?? "",
          purchase_cost: d.purchase_cost != null ? String(d.purchase_cost) : "",
          current_value: d.current_value != null ? String(d.current_value) : "",
          warranty_expiry: d.warranty_expiry ?? "",
          notes: d.notes ?? "",
        });
      })
      .catch(() => setFetchError("Failed to load asset. It may have been deleted."))
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
    if (!form.name.trim()) e.name = "Asset name is required";
    if (!form.category) e.category = "Category is required";
    if (form.purchase_cost && isNaN(Number(form.purchase_cost)))
      e.purchase_cost = "Must be a valid number";
    if (form.current_value && isNaN(Number(form.current_value)))
      e.current_value = "Must be a valid number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await updateAsset(editId, {
        ...form,
        purchase_cost: form.purchase_cost ? parseFloat(form.purchase_cost) : undefined,
        current_value: form.current_value ? parseFloat(form.current_value) : undefined,
      });
      setMsg({ type: "success", text: "Asset updated successfully" });
      setTimeout(() => router.push("/Assets/List"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to update asset" });
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
          Loading asset...
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
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${msg.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"
            }`}>{msg.text}</div>
        )}

        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Assets
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Edit Asset</h1>
            {assetTag && <p className="text-gray-400 font-mono text-sm">{assetTag}</p>}
          </div>
          {assetStatus && (
            <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[assetStatus] || "bg-gray-800 text-gray-400 border-gray-600"}`}>
              {assetStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {assetStatus && !["IN_STOCK", "IN_REPAIR"].includes(assetStatus) && (
          <div className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-300/80">
              Asset tag is permanent and cannot be changed. To change the asset status, use the status action on the list page.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── Identity ─────────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">Asset Identity</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL hint="Asset tag is permanent — contact admin to change">Asset Tag</FL>
                <div className={INPUT_READONLY}>{assetTag || "—"}</div>
              </div>
              <div>
                <FL>Serial Number</FL>
                <input type="text" value={form.serial_number} onChange={set("serial_number")}
                  placeholder="Manufacturer serial number"
                  className={`${INPUT} font-mono`} />
              </div>
            </div>

            <div>
              <FL required>Asset Name</FL>
              <input type="text" value={form.name} onChange={set("name")}
                placeholder="e.g. Dell Latitude 5540 Laptop"
                className={`${INPUT} ${errors.name ? "border-red-500" : ""}`} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <FL required>Category</FL>
              <select value={form.category} onChange={set("category")}
                className={`${INPUT} ${errors.category ? "border-red-500" : ""}`}>
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
          </section>

          {/* ── Financials ───────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">Purchase & Value</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <FL>Purchase Date</FL>
                <input type="date" value={form.purchase_date} onChange={set("purchase_date")} className={INPUT} />
              </div>
              <div>
                <FL>Purchase Cost ($)</FL>
                <input type="number" min={0} step={0.01} value={form.purchase_cost} onChange={set("purchase_cost")}
                  placeholder="0.00"
                  className={`${INPUT} font-mono ${errors.purchase_cost ? "border-red-500" : ""}`} />
                {errors.purchase_cost && <p className="text-red-400 text-xs mt-1">{errors.purchase_cost}</p>}
              </div>
              <div>
                <FL>Current Value ($)</FL>
                <input type="number" min={0} step={0.01} value={form.current_value} onChange={set("current_value")}
                  placeholder="0.00"
                  className={`${INPUT} font-mono ${errors.current_value ? "border-red-500" : ""}`} />
                {errors.current_value && <p className="text-red-400 text-xs mt-1">{errors.current_value}</p>}
              </div>
            </div>

            <div>
              <FL>Warranty Expiry</FL>
              <input type="date" value={form.warranty_expiry} onChange={set("warranty_expiry")} className={INPUT} />
              <p className="text-gray-600 text-xs mt-1">Assets expiring within 30 days are flagged with a warning</p>
            </div>
          </section>

          {/* ── Notes ───────────────────────────────────────────── */}
          <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <FL>Notes</FL>
            <textarea value={form.notes} onChange={set("notes")} rows={3}
              placeholder="Condition notes, configuration details, accessories..."
              className={`${INPUT} resize-none`} />
          </section>

          <div className="flex gap-4 justify-end">
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
