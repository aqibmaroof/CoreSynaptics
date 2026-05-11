"use client";

import { useState, useEffect } from "react";
import {
  getCarriers,
  createCarrier,
  updateCarrier,
} from "@/services/ShipmentLogistics";

const INPUT =
  "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}
    {required && <span className="text-red-400 ml-1">*</span>}
  </label>
);

const REGIONS = [
  "UAE",
  "KSA",
  "Egypt",
  "Global",
  "North America",
  "Europe",
  "Asia Pacific",
  "Africa",
];

const Toast = ({ msg }) =>
  msg ? (
    <div
      className={` z-50 px-4 py-3 rounded-lg border shadow-xl text-sm flex items-center gap-2 ${
        msg.type === "success"
          ? "bg-green-900/90 border-green-500/40 text-green-300"
          : "bg-red-900/90 border-red-500/40 text-red-300"
      }`}
    >
      {msg.text}
    </div>
  ) : null;

const emptyForm = () => ({
  name: "",
  code: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  serviceRegions: [],
  apiIntegrationEnabled: false,
  trackingUrlTemplate: "",
});

export default function CarriersList() {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [searchTerm, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCarriers();
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const fetchCarriers = async () => {
    try {
      setLoading(true);
      const res = await getCarriers();
      setCarriers(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch {
      setError("Failed to load carriers");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm());
    setEditingCarrier(null);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (carrier) => {
    setForm({
      name: carrier.name || "",
      code: carrier.code || "",
      contactName: carrier.contactName || "",
      contactEmail: carrier.contactEmail || "",
      contactPhone: carrier.contactPhone || "",
      website: carrier.website || "",
      serviceRegions: carrier.serviceRegions || [],
      apiIntegrationEnabled: carrier.apiIntegrationEnabled || false,
      trackingUrlTemplate: carrier.trackingUrlTemplate || "",
    });
    setEditingCarrier(carrier);
    setErrors({});
    setShowModal(true);
  };

  const set = (k) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const toggleRegion = (region) => {
    setForm((p) => ({
      ...p,
      serviceRegions: p.serviceRegions.includes(region)
        ? p.serviceRegions.filter((r) => r !== region)
        : [...p.serviceRegions, region],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Carrier name is required";
    if (form.contactEmail && !/\S+@\S+\.\S+/.test(form.contactEmail))
      e.contactEmail = "Invalid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        code: form.code || undefined,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        website: form.website || undefined,
        serviceRegions: form.serviceRegions,
        apiIntegrationEnabled: form.apiIntegrationEnabled,
        trackingUrlTemplate: form.trackingUrlTemplate || undefined,
      };

      if (editingCarrier) {
        await updateCarrier(editingCarrier.id, payload);
        setMsg({ type: "success", text: "Carrier updated successfully" });
      } else {
        await createCarrier(payload);
        setMsg({ type: "success", text: "Carrier added successfully" });
      }
      setShowModal(false);
      await fetchCarriers();
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to save carrier" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = carriers.filter(
    (c) =>
      !searchTerm ||
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contactName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contactEmail || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    total: carriers.length,
    active: carriers.filter((c) => c.isActive !== false).length,
    apiEnabled: carriers.filter((c) => c.apiIntegrationEnabled).length,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Carriers</h1>
            <p className="text-gray-400">
              Manage shipping carriers, contact info, and service regions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Toast msg={msg} />
            <button
              onClick={openCreate}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Carrier
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Carriers",
              value: stats.total,
              color: "text-white",
            },
            { label: "Active", value: stats.active, color: "text-green-400" },
            {
              label: "API Integrated",
              value: stats.apiEnabled,
              color: "text-cyan-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4"
            >
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                {s.label}
              </p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, code, or contact..."
            value={searchTerm}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {[
                      "Carrier",
                      "Contact",
                      "Service Regions",
                      "API Integration",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((carrier) => (
                    <tr
                      key={carrier.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Name + Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-900/60 to-blue-900/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                            {(carrier.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {carrier.name}
                            </p>
                            {carrier.code && (
                              <p className="text-gray-500 text-xs mt-0.5 font-mono">
                                {carrier.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {carrier.contactName && (
                            <p className="text-gray-300 text-xs font-medium">
                              {carrier.contactName}
                            </p>
                          )}
                          {carrier.contactEmail && (
                            <p className="text-gray-400 text-xs flex items-center gap-1.5">
                              <svg
                                className="w-3 h-3 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {carrier.contactEmail}
                            </p>
                          )}
                          {carrier.contactPhone && (
                            <p className="text-gray-400 text-xs flex items-center gap-1.5">
                              <svg
                                className="w-3 h-3 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {carrier.contactPhone}
                            </p>
                          )}
                          {carrier.website && (
                            <a
                              href={carrier.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-500 text-xs hover:underline flex items-center gap-1.5"
                            >
                              <svg
                                className="w-3 h-3 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              Website
                            </a>
                          )}
                          {!carrier.contactEmail &&
                            !carrier.contactPhone &&
                            !carrier.contactName && (
                              <span className="text-gray-600 text-xs">
                                No contact info
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Regions */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(carrier.serviceRegions || []).length > 0 ? (
                            carrier.serviceRegions.map((r) => (
                              <span
                                key={r}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 border border-blue-700/30"
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* API Integration */}
                      <td className="px-5 py-4">
                        {carrier.apiIntegrationEnabled ? (
                          <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Enabled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <span className="w-2 h-2 rounded-full bg-gray-600" />
                            Manual
                          </span>
                        )}
                      </td>

                      {/* Active status */}
                      <td className="px-5 py-4">
                        {carrier.isActive !== false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/30 text-green-300 border border-green-700/30">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openEdit(carrier)}
                          className="text-cyan-400 hover:opacity-80 text-[11px] px-3 py-1 rounded bg-gray-800/50"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center text-gray-500 py-14"
                      >
                        {searchTerm
                          ? "No carriers match your search"
                          : "No carriers added yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Create / Edit Modal ── */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-white font-bold text-lg mb-6">
                {editingCarrier ? "Edit Carrier" : "Add Carrier"}
              </h3>

              <div className="space-y-5">
                {/* Name + Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FL required>Carrier Name</FL>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="e.g. FedEx, DHL, Aramex"
                      className={`${INPUT} ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <FL>Code</FL>
                    <input
                      type="text"
                      value={form.code}
                      onChange={set("code")}
                      placeholder="e.g. DHL"
                      className={`${INPUT} font-mono uppercase`}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <FL>Contact Name</FL>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={set("contactName")}
                    placeholder="Account manager name"
                    className={INPUT}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FL>Contact Email</FL>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={set("contactEmail")}
                      placeholder="ops@carrier.com"
                      className={`${INPUT} ${errors.contactEmail ? "border-red-500" : ""}`}
                    />
                    {errors.contactEmail && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.contactEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <FL>Contact Phone</FL>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={set("contactPhone")}
                      placeholder="+1 800 000 0000"
                      className={INPUT}
                    />
                  </div>
                </div>

                <div>
                  <FL>Website</FL>
                  <input
                    type="url"
                    value={form.website}
                    onChange={set("website")}
                    placeholder="https://carrier.com"
                    className={INPUT}
                  />
                </div>

                {/* Tracking URL template */}
                <div>
                  <FL>Tracking URL Template</FL>
                  <input
                    type="text"
                    value={form.trackingUrlTemplate}
                    onChange={set("trackingUrlTemplate")}
                    placeholder="https://carrier.com/track?id={trackingNumber}"
                    className={`${INPUT} font-mono text-xs`}
                  />
                  <p className="text-gray-600 text-xs mt-1">
                    Use{" "}
                    <code className="text-gray-500">{"{trackingNumber}"}</code>{" "}
                    as the placeholder.
                  </p>
                </div>

                {/* Service Regions */}
                <div>
                  <FL>Service Regions</FL>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {REGIONS.map((region) => {
                      const selected = form.serviceRegions.includes(region);
                      return (
                        <button
                          key={region}
                          type="button"
                          onClick={() => toggleRegion(region)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            selected
                              ? "bg-blue-600/30 border-blue-500/50 text-blue-300"
                              : "bg-gray-800/50 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {selected && "✓ "}
                          {region}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* API Integration */}
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    form.apiIntegrationEnabled
                      ? "bg-green-900/20 border-green-500/30"
                      : "bg-gray-800/40 border-gray-700"
                  }`}
                >
                  <input
                    id="api_toggle"
                    type="checkbox"
                    checked={form.apiIntegrationEnabled}
                    onChange={set("apiIntegrationEnabled")}
                    className="mt-0.5 w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="api_toggle" className="cursor-pointer">
                    <p
                      className={`text-sm font-medium ${form.apiIntegrationEnabled ? "text-green-300" : "text-gray-400"}`}
                    >
                      API Integration Enabled
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Real-time tracking updates will be pulled from the
                      carrier's API
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
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
                  {saving
                    ? "Saving..."
                    : editingCarrier
                      ? "Update Carrier"
                      : "Add Carrier"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
