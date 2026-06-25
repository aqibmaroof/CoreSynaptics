"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAsset } from "@/services/AssetManagement";
import { listV2Projects } from "@/services/CxProjectsV2";
import { required, lengthBetween, numeric } from "@/Utils/validation";

// Asset Tag is a coded identifier — allow alphanumerics plus dash/underscore/dot.
const ASSET_TAG_PATTERN = /^[A-Za-z0-9._-]+$/;
// Asset Name is human-readable — letters/numbers/spaces and common punctuation.
const ASSET_NAME_PATTERN = /^[A-Za-z0-9\s.,'&()/-]+$/;

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
    projectId: "",
    purchaseDate: "",
    purchaseCost: "",
    currentValue: "",
    warrantyExpiry: "",
    notes: "",
  });

  // Inline "discard unsaved changes?" confirmation (RA_TC_056).
  const [confirmExit, setConfirmExit] = useState(false);

  // Optional "link to project" dropdown — reuses the V2 projects list.
  const [projects, setProjects] = useState([]);

  // Dirty if the user changed any field from its empty default.
  const isDirty = () =>
    Object.values(form).some((v) => (v ?? "").toString().trim() !== "");

  // Request to leave: warn first if there are unsaved changes (RA_TC_056).
  const requestExit = () => {
    if (isDirty()) {
      setConfirmExit(true);
      return;
    }
    router.back();
  };

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await listV2Projects({ limit: 100 });
        const arr = Array.isArray(r)
          ? r
          : (r?.data ?? r?.projects ?? r?.items ?? []);
        if (alive) setProjects(arr);
      } catch {
        // non-fatal — the dropdown just stays empty (asset can be org-only)
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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

  // Optional numeric money field that, when filled, must be strictly > 0.
  // numeric()'s min is inclusive, so we additionally reject 0 explicitly.
  const validatePositiveMoney = (raw, label) => {
    if (!raw) return ""; // optional — empty is allowed
    const err = numeric(raw, { label, min: 0 });
    if (err) return err;
    if (Number(raw) <= 0) return `${label} must be greater than 0.`;
    return "";
  };

  const validate = () => {
    const e = {};

    const tag = form.assetTag.trim();
    const tagReq = required(tag, "Asset tag");
    if (tagReq) e.assetTag = tagReq;
    else if (tag.length > 50) e.assetTag = "Asset tag cannot exceed 50 characters.";
    else if (!ASSET_TAG_PATTERN.test(tag))
      e.assetTag =
        "Asset tag may only contain letters, numbers, dashes, underscores and dots.";

    const name = form.name.trim();
    const nameReq = required(name, "Asset name");
    if (nameReq) e.name = nameReq;
    else {
      const lenErr = lengthBetween(name, { max: 100, label: "Asset name" });
      if (lenErr) e.name = lenErr;
      else if (!ASSET_NAME_PATTERN.test(name))
        e.name =
          "Asset name may only contain letters, numbers, spaces and common punctuation.";
    }

    if (!form.category) e.category = "Category is required";
    if (!form.procurementType) e.procurementType = "ProcurementType is required.";
    else if (!["CFCI", "OFCI"].includes(form.procurementType))
      e.procurementType = "ProcurementType must be one of: CFCI, OFCI.";

    const costErr = validatePositiveMoney(form.purchaseCost, "Purchase cost");
    if (costErr) e.purchaseCost = costErr;
    const valueErr = validatePositiveMoney(form.currentValue, "Current value");
    if (valueErr) e.currentValue = valueErr;

    const notesErr = lengthBetween(form.notes, { max: 1000, label: "Notes" });
    if (notesErr) e.notes = notesErr;

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createAsset({
        assetTag: form.assetTag.trim(),
        name: form.name.trim(),
        category: form.category,
        procurementType: form.procurementType,
        // Optional: also materialize this asset in the chosen project's playbook.
        projectId: form.projectId || undefined,
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
    // This form is styled for a dark surface; give it an opaque dark canvas so
    // the panels/inputs read as an intentional theme rather than a muddy
    // translucent overlay on the light app background (RA_TC_069/070/072).
    <div className="min-h-screen p-6 bg-[#0a1128]">
      <div className="mx-auto">
        <button
          type="button"
          onClick={requestExit}
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
          <section className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-5">
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
                maxLength={50}
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
                maxLength={100}
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

            <div>
              <FL hint="Optional — also lists this asset in the project's playbook.">
                Link to Project
              </FL>
              <select
                className={INPUT}
                value={form.projectId}
                onChange={set("projectId")}
              >
                <option value="">— No project (org register only) —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName ?? p.name ?? p.id}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* ── Financials ───────────────────────────────────────── */}
          <section className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-5">
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
                  min={0.01}
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
                  min={0.01}
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
          <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <FL>Notes</FL>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              maxLength={1000}
              placeholder="Condition notes, configuration details, accessories..."
              className={`${INPUT} resize-y ${errors.notes ? "border-red-500" : ""}`}
            />
            {errors.notes && (
              <p className="text-red-400 text-xs mt-1">{errors.notes}</p>
            )}
          </section>

          {confirmExit && (
            <div
              role="alertdialog"
              aria-label="Discard unsaved asset?"
              className="rounded-xl border border-red-500/50 bg-gray-900 p-4"
            >
              <p className="text-sm font-semibold text-white mb-3">
                Discard this asset? Your unsaved changes will be lost.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmExit(false)}
                  className="px-5 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={requestExit}
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
