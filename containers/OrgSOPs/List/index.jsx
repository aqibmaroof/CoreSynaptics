"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listOrgSOPs, deleteOrgSOP, updateOrgSOP } from "@/services/OrgSOPs";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

export default function OrgSOPList() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    listOrgSOPs()
      .then((res) => setItems(toArray(res)))
      .catch(() => setError("Failed to load SOPs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteOrgSOP(id);
      setDeleteConfirm(null);
      load();
    } catch {
      setError("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      await updateOrgSOP(item.id, { isActive: !item.isActive });
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
            <h1 className="text-2xl font-bold">Org SOPs</h1>
            <p className="text-gray-400 text-sm mt-1">Standard operating procedures library</p>
          </div>
          <button onClick={() => router.push("/OrgSOPs/Add")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            + New SOP
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No SOPs found.</div>
        ) : (
          <div className="space-y-3">
            {items.map((sop) => (
              <div key={sop.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{sop.name}</span>
                    {sop.category && (
                      <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded font-mono">{sop.category}</span>
                    )}
                    {sop.version && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">{sop.version}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${sop.isActive ? "bg-green-900/40 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                      {sop.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {sop.description && <p className="text-sm text-gray-400 truncate">{sop.description}</p>}
                  {sop.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sop.tags.map((t) => <span key={t} className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">{t}</span>)}
                    </div>
                  )}
                  {sop.documentUrl && (
                    <a href={sop.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">
                      View Document ↗
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(sop)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    {sop.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => router.push(`/OrgSOPs/Edit/${sop.id}`)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(sop.id)} className="px-3 py-1.5 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-2">Delete SOP?</h3>
            <p className="text-sm text-gray-400 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
