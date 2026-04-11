"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const PHASES = ["L1", "L2", "L3", "L4", "L5"];
const CHECKLIST_TYPES = ["vendor", "gc", "cxagent", "trade"];
const STATUSES = ["Not Started", "In Progress", "Complete", "Verified"];
const RESPONSE_OPTIONS = ["No Answer", "Pass", "Fail", "NA"];

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
  Pass:        "bg-green-600/20 border-green-500/60 text-green-300",
  Fail:        "bg-red-600/20 border-red-500/60 text-red-300",
  NA:          "bg-gray-600/30 border-gray-500/60 text-gray-300",
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
function ItemCard({ item, index, users, onChange }) {
  const responseStyle = RESPONSE_STYLES[item.response] || RESPONSE_STYLES["No Answer"];

  return (
    <div className={`bg-gray-800/60 border rounded-xl overflow-hidden transition-all
      ${item.response === "Fail"
        ? "border-red-500/30"
        : item.response === "Pass"
          ? "border-green-500/20"
          : "border-gray-700"
      }`}
    >
      {/* Item Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
            {index + 1}
          </span>
          <input
            type="text"
            value={item.item_number ?? `${index + 1}`}
            onChange={(e) => onChange(index, "item_number", e.target.value)}
            placeholder="Item #"
            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs 
              focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
        </div>
        {/* Response status pill */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${responseStyle}`}>
          {item.response || "No Answer"}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={item.description || ""}
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
            value={item.response || "No Answer"}
            onChange={(val) => onChange(index, "response", val)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            value={item.notes || ""}
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
              value={item.signed_by || ""}
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
              value={item.signed_at
                ? item.signed_at.slice(0, 16)   // trim seconds/timezone for input compat
                : ""}
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
                value={item.witnessed_by || ""}
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
export default function ChecklistEdit() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    assigned_by_user_id: "",
    signed_by_user_id: "",
    status: "Not Started",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const checklistRes = await fetch(`/api/checklists/${params.id}`);
      if (!checklistRes.ok) throw new Error("Failed to fetch checklist");
      const checklist = await checklistRes.json();

      const itemsRes = await fetch(`/api/checklists/${params.id}/items`);
      if (itemsRes.ok) {
        const raw = await itemsRes.json();
        // Normalise: ensure every item has all required fields
        setItems(raw.map((item) => ({
          id: item.id,
          checklist_id: item.checklist_id ?? params.id,
          item_number: item.item_number ?? "",
          description: item.description ?? "",
          response: item.response ?? "No Answer",
          notes: item.notes ?? "",
          signed_by: item.signed_by ?? "",
          signed_at: item.signed_at ?? "",
          requires_witness: item.requires_witness ?? false,
          witnessed_by: item.witnessed_by ?? "",
        })));
      }

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

      setFormData({
        phase: checklist.phase,
        checklist_type: checklist.checklist_type,
        project_id: checklist.project_id || "",
        asset_id: checklist.asset_id || "",
        assigned_to_company_id: checklist.assigned_to_company_id || "",
        assigned_by_user_id: checklist.assigned_by_user_id || "",
        signed_by_user_id: checklist.signed_by_user_id || "",
        status: checklist.status,
      });
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load checklist");
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validItems = items.filter((i) => i.description?.trim());
      const response = await fetch(`/api/checklists/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          total_items: validItems.length,
          completed_items: validItems.filter((i) => i.response === "Pass").length,
          items: validItems,
        }),
      });
      if (!response.ok) throw new Error("Failed to update checklist");
      router.push("/Checklist/List");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // ── Progress stats ──────────────────────────────────────────────────
  const passCount  = items.filter((i) => i.response === "Pass").length;
  const failCount  = items.filter((i) => i.response === "Fail").length;
  const naCount    = items.filter((i) => i.response === "NA").length;
  const pendCount  = items.filter((i) => i.response === "No Answer" || !i.response).length;
  const pct = items.length ? Math.round((passCount / items.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Loading checklist…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Edit Checklist</h1>
          <p className="text-gray-400">Update checklist details and items</p>
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
              <h2 className="text-lg font-semibold text-white">Checklist Details</h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Phase</label>
                  <AppSelect name="phase" value={formData.phase} onChange={handleChange}
                    options={PHASES.map((p) => ({ value: p, label: p }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Type</label>
                  <AppSelect name="checklist_type" value={formData.checklist_type} onChange={handleChange}
                    options={CHECKLIST_TYPES.map((t) => ({ value: t, label: t.toUpperCase() }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Status</label>
                  <AppSelect name="status" value={formData.status} onChange={handleChange}
                    options={STATUSES.map((s) => ({ value: s, label: s }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Project</label>
                  <AppSelect name="project_id" value={formData.project_id} onChange={handleChange}
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="— Select Project —" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Asset</label>
                  <AppSelect name="asset_id" value={formData.asset_id} onChange={handleChange}
                    options={assets.map((a) => ({ value: a.id, label: a.name }))}
                    placeholder="— Select Asset —" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Assigned to Company</label>
                  <AppSelect name="assigned_to_company_id" value={formData.assigned_to_company_id} onChange={handleChange}
                    options={companies.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="— Select Company —" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Assigned By</label>
                  <AppSelect name="assigned_by_user_id" value={formData.assigned_by_user_id} onChange={handleChange}
                    options={users.map((u) => ({ value: u.id, label: u.name }))}
                    placeholder="— Select User —" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Signed By</label>
                  <AppSelect name="signed_by_user_id" value={formData.signed_by_user_id} onChange={handleChange}
                    options={users.map((u) => ({ value: u.id, label: u.name }))}
                    placeholder="— Select User —" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Checklist Items Card ── */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            {/* Items header with progress */}
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">
                  Checklist Items
                  <span className="ml-2 text-sm font-normal text-gray-400">({items.length})</span>
                </h2>
                {/* Mini stats */}
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-yellow-600/10 border border-yellow-600/30 text-yellow-400">{pendCount} pending</span>
                  <span className="px-2 py-0.5 rounded bg-green-600/20 border border-green-500/30 text-green-400">{passCount} pass</span>
                  <span className="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/30 text-red-400">{failCount} fail</span>
                  <span className="px-2 py-0.5 rounded bg-gray-600/30 border border-gray-500/30 text-gray-400">{naCount} n/a</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Completion</span>
                  <span className="font-semibold text-white">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No items found for this checklist.</p>
              ) : (
                items.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    users={users}
                    onChange={handleItemChange}
                  />
                ))
              )}
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
              disabled={saving}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600
                text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                shadow-lg shadow-blue-900/30"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving…
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}