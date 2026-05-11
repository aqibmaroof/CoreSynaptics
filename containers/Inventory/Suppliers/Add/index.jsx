"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createSupplier,
  getSupplierById,
  updateSupplier,
} from "@/services/Inventory";

const INPUT =
  "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const INPUT_READONLY =
  "w-full px-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-gray-400 text-sm cursor-not-allowed select-none font-mono";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}
    {required && <span className="text-red-400 ml-1">*</span>}
  </label>
);
const Err = ({ msg }) =>
  msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

const EMPTY_FORM = {
  name: "",
  code: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  notes: "",
};

export default function SuppliersAdd({ editId }) {
  const router = useRouter();
  const isEdit = !!editId;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    getSupplierById(editId)
      .then((res) => {
        const d = res?.data ?? res;
        setForm({
          name: d.name || "",
          code: d.code || "",
          contactName: d.contactName || "",
          email: d.email || "",
          phone: d.phone || "",
          address: d.address || "",
          city: d.city || "",
          country: d.country || "",
          notes: d.notes || "",
        });
      })
      .catch(() =>
        setFetchError("Failed to load supplier. It may have been deleted."),
      )
      .finally(() => setFetching(false));
  }, [editId]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((f) => ({ ...f, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Supplier name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        contactName: form.contactName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      if (isEdit) {
        await updateSupplier(editId, payload);
        setMsg({ type: "success", text: "Supplier updated successfully" });
      } else {
        await createSupplier(payload);
        setMsg({ type: "success", text: "Supplier created successfully" });
      }
      setTimeout(() => router.push("/Inventory/Suppliers/List"), 1500);
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save supplier",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
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
        {msg && (
          <div
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
              msg.type === "success"
                ? "bg-green-900/80 border-green-500/30 text-green-300"
                : "bg-red-900/80 border-red-500/30 text-red-300"
            }`}
          >
            {msg.text}
          </div>
        )}

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
          Back to Suppliers
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">
          {isEdit ? "Edit Supplier" : "Add Supplier"}
        </h1>
        <p className="text-gray-400 mb-8">
          {isEdit
            ? "Update supplier details and contact information."
            : "Add a vendor or supplier you purchase inventory from."}
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Identity */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Supplier Identity
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL required>Supplier Name</FL>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. TechSource LLC"
                  className={`${INPUT} ${errors.name ? "border-red-500" : ""}`}
                />
                <Err msg={errors.name} />
              </div>

              <div>
                <FL>Supplier Code</FL>
                <input
                  type="text"
                  value={form.code}
                  onChange={set("code")}
                  placeholder="e.g. SUP-001"
                  className={`${INPUT} font-mono`}
                />
                <p className="text-gray-600 text-xs mt-1">
                  Optional short code for quick reference
                </p>
              </div>
            </div>

            <div>
              <FL>Notes</FL>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Payment terms, preferred categories, any special notes..."
                className={`${INPUT} resize-none`}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Contact Information
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FL>Contact Name</FL>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={set("contactName")}
                  placeholder="e.g. Sarah Johnson"
                  className={INPUT}
                />
              </div>

              <div>
                <FL>Email</FL>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="e.g. sarah@techsource.com"
                  className={`${INPUT} ${errors.email ? "border-red-500" : ""}`}
                />
                <Err msg={errors.email} />
              </div>

              <div>
                <FL>Phone</FL>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+1-555-010-0100"
                  className={INPUT}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">
              Address
            </p>

            <div>
              <FL>Street Address</FL>
              <input
                type="text"
                value={form.address}
                onChange={set("address")}
                placeholder="e.g. 500 Commerce Drive"
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
                  placeholder="e.g. San Francisco"
                  className={INPUT}
                />
              </div>
              <div>
                <FL>Country</FL>
                <input
                  type="text"
                  value={form.country}
                  onChange={set("country")}
                  placeholder="e.g. USA"
                  className={INPUT}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.name && (
            <div className="bg-gray-900/50 rounded-xl border border-cyan-500/20 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Preview
              </p>
              <div className="flex items-start gap-4">
                <span className="text-4xl">🏢</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">{form.name}</p>
                    {form.code && (
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">
                        {form.code}
                      </span>
                    )}
                  </div>
                  {form.contactName && (
                    <p className="text-gray-400 text-xs mt-1">
                      Contact: {form.contactName}
                      {form.phone ? ` · ${form.phone}` : ""}
                    </p>
                  )}
                  {form.email && (
                    <p className="text-gray-500 text-xs mt-0.5">{form.email}</p>
                  )}
                  {(form.city || form.country) && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      {[form.city, form.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {form.notes && (
                    <p className="text-gray-600 text-xs mt-1 italic truncate max-w-sm">
                      {form.notes}
                    </p>
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
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Supplier"
                  : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
