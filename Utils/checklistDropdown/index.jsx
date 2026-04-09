"use client";

import { useState, useEffect } from "react";

export function ChecklistDropdownForProjects({
  entityType,
  selectedChecklist,
  onChecklistChange,
  disabled = false,
}) {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (entityType === "Project") {
      fetchChecklists();
    }
  }, [entityType]);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const response = await fetch("/checklist");
      if (!response.ok) throw new Error("Failed to fetch checklists");
      const data = await response.json();
      setChecklists(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load checklists");
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  if (entityType !== "Project") {
    return null;
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-white mb-2">
        Checklist <span className="text-gray-400">(optional)</span>
      </label>
      <select
        value={selectedChecklist}
        onChange={(e) => onChecklistChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all [&_option]:bg-gray-700 [&_option]:text-white disabled:opacity-50"
      >
        <option value="">
          {loading ? "Loading checklists..." : "— Select Checklist —"}
        </option>
        {checklists.map((checklist) => (
          <option key={checklist.id} value={checklist.id}>
            {checklist.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
