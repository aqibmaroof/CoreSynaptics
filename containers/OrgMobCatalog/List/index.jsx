"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listOrgMobCatalog, deleteOrgMobCatalogItem, MOB_STEP_KEYS } from "@/services/OrgMobCatalog";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

const STEP_LABELS = {
  mob_site: "Site Setup", mob_ppe: "PPE", mob_supplies: "Supplies",
  mob_trailer: "Trailer", mob_house: "Housing", mob_tools: "Tools",
};

export default function OrgMobCatalogList() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filterStep, setFilterStep] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    listOrgMobCatalog(filterStep ? { stepKey: filterStep } : {})
      .then((res) => setItems(toArray(res)))
      .catch(() => setError("Failed to load catalog."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStep]);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteOrgMobCatalogItem(id);
      setDeleteConfirm(null);
      load();
    } catch {
      setError("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mobilization Catalog</h1>
            <p className="text-gray-400 text-sm mt-1">Org-level mobilization items by step</p>
          </div>
          <button onClick={() => router.push("/OrgMobCatalog/Add")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            + New Item
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => setFilterStep("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterStep ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
            All
          </button>
          {MOB_STEP_KEYS.map((k) => (
            <button key={k} onClick={() => setFilterStep(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStep === k ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              {STEP_LABELS[k]}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No catalog items found.</div>
        ) : (
          <div className="overflow-hidden border border-gray-700 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Step</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {items.map((item) => (
                  <tr key={item.id} className="bg-gray-800/50 hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">{STEP_LABELS[item.stepKey] ?? item.stepKey}</span></td>
                    <td className="px-4 py-3 text-gray-300">{item.category}</td>
                    <td className="px-4 py-3 text-right text-gray-300 font-mono">{item.defaultQty ?? 1}</td>
                    <td className="px-4 py-3 text-right text-gray-300 font-mono">${Number(item.defaultUnitCost ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => router.push(`/OrgMobCatalog/Edit/${item.id}`)} className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="px-3 py-1 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-2">Delete Item?</h3>
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
