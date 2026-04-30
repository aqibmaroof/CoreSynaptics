"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listOrgSafetyPlans, deleteOrgSafetyPlan, updateOrgSafetyPlan } from "@/services/OrgSafetyPlans";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

export default function OrgSafetyPlanList() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    listOrgSafetyPlans()
      .then((res) => setItems(toArray(res)))
      .catch(() => setError("Failed to load safety plans."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteOrgSafetyPlan(id);
      setDeleteConfirm(null);
      load();
    } catch {
      setError("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const setDefault = async (item) => {
    try {
      await updateOrgSafetyPlan(item.id, { isDefault: true });
      load();
    } catch {
      setError("Update failed.");
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Safety Plan Templates</h1>
            <p className="text-gray-400 text-sm mt-1">Organization safety plan defaults</p>
          </div>
          <button onClick={() => router.push("/OrgSafetyPlans/Add")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            + New Template
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No safety plan templates found.</div>
        ) : (
          <div className="space-y-3">
            {items.map((plan) => (
              <div key={plan.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{plan.name}</span>
                    {plan.isDefault && (
                      <span className="text-xs bg-yellow-900/40 text-yellow-300 px-2 py-0.5 rounded font-mono">Default</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-400">
                    {plan.safetyManagerRole && <span>Manager: {plan.safetyManagerRole}</span>}
                    {plan.toolboxTalkFrequency && <span>Toolbox talks: {plan.toolboxTalkFrequency}</span>}
                    {plan.requiredPpe && <span className="col-span-2">PPE: {plan.requiredPpe}</span>}
                  </div>
                  <div className="flex gap-3 mt-2">
                    {plan.nfpa70eRequired && <span className="text-xs bg-orange-900/30 text-orange-300 px-2 py-0.5 rounded">NFPA 70E</span>}
                    {plan.osha30Required && <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">OSHA 30</span>}
                    {plan.osha10Required && <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">OSHA 10</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!plan.isDefault && (
                    <button onClick={() => setDefault(plan)} className="px-3 py-1.5 text-xs bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-300 rounded-lg transition-colors">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => router.push(`/OrgSafetyPlans/Edit/${plan.id}`)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => setDeleteConfirm(plan.id)} className="px-3 py-1.5 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-2">Delete Template?</h3>
            <p className="text-sm text-gray-400 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
