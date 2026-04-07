"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PHASES = ["L1", "L2", "L3", "L4", "L5"];
const CHECKLIST_TYPES = ["vendor", "gc", "cxagent", "trade"];
const RESPONSE_OPTIONS = ["No Answer", "Pass", "Fail", "NA"];

function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const makeItem = (index) => ({
  id: generateId(),
  sequence: index + 1,
  item_number: `${index + 1}`,
  description: "",
  response: "No Answer",
  notes: "",
  signed_by: "",
  signed_at: "",
  requires_witness: false,
  witnessed_by: "",
});

// ─── REUSABLE SELECT ──────────────────────────────────────────────────────────
function AppSelect({ name, value, onChange, options, placeholder, disabled, small }) {
  const cls = small
    ? "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none"
    : "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none";
  return (
    <div className="relative">
      <select name={name} value={value} onChange={onChange} disabled={disabled} className={cls}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

// ─── RESPONSE BADGE SELECTOR ──────────────────────────────────────────────────
const RESPONSE_STYLES = {
  Pass:      "bg-green-600/20 border-green-500/60 text-green-300",
  Fail:      "bg-red-600/20 border-red-500/60 text-red-300",
  NA:        "bg-gray-600/30 border-gray-500/60 text-gray-300",
  "No Answer": "bg-yellow-600/10 border-yellow-600/40 text-yellow-400",
};

function ResponseSelector({ value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {RESPONSE_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all
            ${value === opt
              ? RESPONSE_STYLES[opt]
              : "bg-gray-800 border-gray-600 text-gray-500 hover:border-gray-500 hover:text-gray-300"
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── ITEM CARD ────────────────────────────────────────────────────────────────
function ItemCard({ item, index, users, onChange, onRemove, canRemove }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
      {/* Item Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-750 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
            {index + 1}
          </span>
          <input
            type="text"
            value={item.item_number}
            onChange={(e) => onChange(index, "item_number", e.target.value)}
            placeholder="Item #"
            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs 
              focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
            title="Remove item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={item.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            placeholder="Describe what needs to be verified or checked…"
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white 
              placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Response */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Response
          </label>
          <ResponseSelector
            value={item.response}
            onChange={(val) => onChange(index, "response", val)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            value={item.notes}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            placeholder="Optional notes or observations…"
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white 
              placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Signature row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Signed By
            </label>
            <AppSelect
              value={item.signed_by}
              onChange={(e) => onChange(index, "signed_by", e.target.value)}
              options={users.map((u) => ({ value: u.id, label: u.name }))}
              placeholder="— Select User —"
              small
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Signed At
            </label>
            <input
              type="datetime-local"
              value={item.signed_at}
              onChange={(e) => onChange(index, "signed_at", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white 
                text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Witness row */}
        <div className="pt-1 border-t border-gray-700/60">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Requires Witness
            </label>
            <button
              type="button"
              onClick={() => onChange(index, "requires_witness", !item.requires_witness)}
              className={`relative w-10 h-5 rounded-full transition-colors
                ${item.requires_witness ? "bg-blue-500" : "bg-gray-600"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform
                ${item.requires_witness ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          {item.requires_witness && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Witnessed By
              </label>
              <AppSelect
                value={item.witnessed_by}
                onChange={(e) => onChange(index, "witnessed_by", e.target.value)}
                options={users.map((u) => ({ value: u.id, label: u.name }))}
                placeholder="— Select Witness —"
                small
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ChecklistAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    phase: "L1",
    checklist_type: "gc",
    project_id: "",
    asset_id: "",
    assigned_to_company_id: "",
    total_items: 0,
    completed_items: 0,
    status: "Not Started",
  });

  const [items, setItems] = useState([makeItem(0)]);

  useEffect(() => {
    fetchRelatedData();
  }, []);

  const fetchRelatedData = async () => {
    try {
      const [projectsRes, assetsRes, companiesRes, usersRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/assets"),
        fetch("/api/companies"),
        fetch("/api/users"),
      ]);
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (assetsRes.ok) setAssets(await assetsRes.json());
      if (companiesRes.ok) setCompanies(await companiesRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error("Error fetching related data:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, makeItem(prev.length)]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems((prev) =>
        prev
          .filter((_, i) => i !== index)
          .map((item, i) => ({ ...item, sequence: i + 1 }))
      );
    }
  };

  const validateForm = () => {
    if (!formData.phase) { setError("Phase is required"); return false; }
    if (!formData.checklist_type) { setError("Checklist type is required"); return false; }
    if (items.filter((i) => i.description.trim()).length === 0) {
      setError("At least one checklist item with a description is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const validItems = items.filter((i) => i.description.trim());
      const response = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist: {
            ...formData,
            total_items: validItems.length,
            completed_items: validItems.filter((i) => i.response === "Pass").length,
          },
          items: validItems,
        }),
      });
      if (!response.ok) throw new Error("Failed to create checklist");
      router.push("/Checklist/List");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const passCount  = items.filter((i) => i.response === "Pass").length;
  const failCount  = items.filter((i) => i.response === "Fail").length;
  const naCount    = items.filter((i) => i.response === "NA").length;
  const pendCount  = items.filter((i) => i.response === "No Answer").length;

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Checklist</h1>
          <p className="text-gray-400">Add a new project checklist with items</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Checklist Details Card ── */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center gap-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-lg font-semibold text-white">Checklist Details</h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Phase <span className="text-red-400">*</span>
                  </label>
                  <AppSelect
                    name="phase"
                    value={formData.phase}
                    onChange={handleChange}
                    options={PHASES.map((p) => ({ value: p, label: p }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <AppSelect
                    name="checklist_type"
                    value={formData.checklist_type}
                    onChange={handleChange}
                    options={CHECKLIST_TYPES.map((t) => ({ value: t, label: t.toUpperCase() }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Project</label>
                  <AppSelect
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="— Select Project —"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Asset</label>
                  <AppSelect
                    name="asset_id"
                    value={formData.asset_id}
                    onChange={handleChange}
                    options={assets.map((a) => ({ value: a.id, label: a.name }))}
                    placeholder="— Select Asset —"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Assign to Company
                </label>
                <AppSelect
                  name="assigned_to_company_id"
                  value={formData.assigned_to_company_id}
                  onChange={handleChange}
                  options={companies.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="— Select Company —"
                />
              </div>
            </div>
          </div>

          {/* ── Checklist Items Card ── */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            {/* Items header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-white">Checklist Items</h2>
                {/* Mini stats */}
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-yellow-600/10 border border-yellow-600/30 text-yellow-400">{pendCount} pending</span>
                  <span className="px-2 py-0.5 rounded bg-green-600/20 border border-green-500/30 text-green-400">{passCount} pass</span>
                  <span className="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/30 text-red-400">{failCount} fail</span>
                  <span className="px-2 py-0.5 rounded bg-gray-600/30 border border-gray-500/30 text-gray-400">{naCount} n/a</span>
                </div>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 
                  text-white rounded-lg text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="p-6 space-y-4">
              {items.map((item, index) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  users={users}
                  onChange={handleItemChange}
                  onRemove={removeItem}
                  canRemove={items.length > 1}
                />
              ))}
            </div>

            {/* Items footer: quick add */}
            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={addItem}
                className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-blue-500/50 
                  rounded-xl text-gray-500 hover:text-blue-400 text-sm font-medium transition-all
                  flex items-center justify-center gap-2 hover:bg-blue-600/5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add another item
              </button>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl 
                font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 
                hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600
                text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                shadow-lg shadow-blue-900/30"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Checklist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}