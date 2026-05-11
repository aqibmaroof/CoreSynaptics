"use client";

import { useState } from "react";
import { createCompany } from "@/services/Companies";

const INPUT_CLS =
  "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500";

const COMPANY_TYPES = [
  "CLIENT",
  "SUBCONTRACTOR",
  "VENDOR",
  "PARTNER",
  "CONSULTANT",
  "OTHER",
];

/**
 * Reusable company select with inline "+ Add New Company" option.
 *
 * Props:
 *   value       – current companyId value
 *   onChange    – (companyId: string) => void
 *   companies   – array of { id, name } from parent
 *   onCreated   – (company) => void  – called after a new company is created
 *                 parent should push the new company into its companies list
 *   label       – optional label string (default: "Company")
 *   required    – whether to show * marker
 */
export default function CompanySelect({
  value,
  onChange,
  companies = [],
  onCreated,
  label = "Company",
  required = false,
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("CLIENT");
  const [newRegion, setNewRegion] = useState("");
  const [err, setErr] = useState("");

  const handleSelectChange = (e) => {
    if (e.target.value === "__add_new__") {
      setShowCreate(true);
      return;
    }
    onChange(e.target.value);
  };

  const handleCreate = async () => {
    if (!newName.trim()) { setErr("Company name is required"); return; }
    setCreating(true);
    setErr("");
    try {
      const res = await createCompany({ name: newName.trim(), type: newType, region: newRegion });
      const company = res?.data || res;
      if (onCreated) onCreated(company);
      onChange(company.id);
      setShowCreate(false);
      setNewName("");
      setNewType("CLIENT");
      setNewRegion("");
    } catch (e) {
      setErr(e?.message || "Failed to create company");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
        {label}{required && " *"}
      </label>

      <select
        value={value}
        onChange={handleSelectChange}
        className={INPUT_CLS + " cursor-pointer"}
      >
        <option value="">— Select Company —</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        <option value="__add_new__">+ Add New Company</option>
      </select>

      {/* Inline create form */}
      {showCreate && (
        <div className="mt-2 p-4 bg-gray-800 border border-cyan-700/50 rounded-lg space-y-3">
          <p className="text-xs font-bold text-cyan-400 uppercase">New Company</p>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <input
            type="text"
            placeholder="Company name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={INPUT_CLS}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className={INPUT_CLS + " cursor-pointer"}
            >
              {COMPANY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Region"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowCreate(false); setErr(""); }}
              className="px-3 py-1.5 border border-gray-600 text-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create & Select"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
