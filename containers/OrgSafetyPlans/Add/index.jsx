"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrgSafetyPlan } from "@/services/OrgSafetyPlans";

const EMPTY = {
  name: "", safetyManagerRole: "", requiredPpe: "", emergencyPlan: "", toolboxTalkFrequency: "",
  nfpa70eRequired: false, osha30Required: false, osha10Required: true, isDefault: false,
};

export default function OrgSafetyPlanAdd() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setLoading(true);
    setError("");
    try {
      await createOrgSafetyPlan({
        name: form.name.trim(),
        safetyManagerRole: form.safetyManagerRole || undefined,
        requiredPpe: form.requiredPpe || undefined,
        emergencyPlan: form.emergencyPlan || undefined,
        toolboxTalkFrequency: form.toolboxTalkFrequency || undefined,
        nfpa70eRequired: form.nfpa70eRequired,
        osha30Required: form.osha30Required,
        osha10Required: form.osha10Required,
        isDefault: form.isDefault,
      });
      router.push("/OrgSafetyPlans");
    } catch (err) {
      setError(err?.message || "Failed to create template.");
    } finally {
      setLoading(false);
    }
  };

  const Check = ({ id, label, checked, onChange }) => (
    <div className="flex items-center gap-3">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} className="w-4 h-4 accent-blue-500" />
      <label htmlFor={id} className="text-sm text-gray-300">{label}</label>
    </div>
  );

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold mb-6">New Safety Plan Template</h1>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Template Name <span className="text-red-400">*</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Data Center Install Safety Plan" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Safety Manager Role</label>
              <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={form.safetyManagerRole} onChange={(e) => set("safetyManagerRole", e.target.value)} placeholder="Safety Lead" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Toolbox Talk Frequency</label>
              <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={form.toolboxTalkFrequency} onChange={(e) => set("toolboxTalkFrequency", e.target.value)} placeholder="Daily" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Required PPE</label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.requiredPpe} onChange={(e) => set("requiredPpe", e.target.value)} placeholder="Hard hat, gloves, boots" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Emergency Plan</label>
            <textarea className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3} value={form.emergencyPlan} onChange={(e) => set("emergencyPlan", e.target.value)}
              placeholder="On-site medical response and evacuation plan" />
          </div>

          <div className="bg-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-gray-300 mb-1">Certifications</p>
            <Check id="nfpa70e" label="NFPA 70E Required" checked={form.nfpa70eRequired} onChange={(e) => set("nfpa70eRequired", e.target.checked)} />
            <Check id="osha30" label="OSHA 30 Required" checked={form.osha30Required} onChange={(e) => set("osha30Required", e.target.checked)} />
            <Check id="osha10" label="OSHA 10 Required" checked={form.osha10Required} onChange={(e) => set("osha10Required", e.target.checked)} />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} className="w-4 h-4 accent-yellow-500" />
            <label htmlFor="isDefault" className="text-sm text-gray-300">Set as organization default</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Create Template"}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
