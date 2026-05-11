"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listOrgToolboxTalks, deleteOrgToolboxTalk, updateOrgToolboxTalk, TBT_CATEGORIES } from "@/services/OrgToolboxTalks";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

export default function OrgToolboxTalkList() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = (cat = categoryFilter) => {
    setLoading(true);
    listOrgToolboxTalks(cat ? { category: cat } : {})
      .then((res) => setItems(toArray(res)))
      .catch(() => setError("Failed to load toolbox talks."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    load(cat);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteOrgToolboxTalk(id);
      setDeleteConfirm(null);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      await updateOrgToolboxTalk(item.id, { isActive: !item.isActive });
      setItems((prev) => prev.map((t) => t.id === item.id ? { ...t, isActive: !item.isActive } : t));
    } catch {
      setError("Update failed.");
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Toolbox Talks</h1>
            <p className="text-gray-400 text-sm mt-1">Organization safety training topics</p>
          </div>
          <button onClick={() => router.push("/OrgToolboxTalks/Add")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            + New Talk
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {["", ...TBT_CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              {cat || "All"}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No toolbox talks found.</div>
        ) : (
          <div className="space-y-3">
            {items.map((talk) => (
              <div key={talk.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{talk.title}</span>
                    {talk.category && (
                      <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded font-mono">{talk.category}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${talk.isActive ? "bg-green-900/30 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                      {talk.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {talk.description && <p className="text-sm text-gray-400 truncate">{talk.description}</p>}
                  {talk.durationMins != null && (
                    <p className="text-xs text-gray-500 font-mono mt-1">{talk.durationMins} min</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(talk)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${talk.isActive ? "bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-300" : "bg-green-900/30 hover:bg-green-900/50 text-green-400"}`}>
                    {talk.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => router.push(`/OrgToolboxTalks/Edit/${talk.id}`)}
                    className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => setDeleteConfirm(talk.id)}
                    className="px-3 py-1.5 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-2">Delete Toolbox Talk?</h3>
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
