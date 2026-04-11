"use client";

import { useState, useEffect } from "react";

export function DocumentsDropdownForProjects({
  entityType,
  selectedDocument,
  onDocumentChange,
  disabled = false,
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (entityType === "Project") {
      fetchDocuments();
    }
  }, [entityType]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/documents");
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load documents");
      setDocuments([]);
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
        Document <span className="text-gray-400">(optional)</span>
      </label>
      <select
        value={selectedDocument}
        onChange={(e) => onDocumentChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all [&_option]:bg-gray-700 [&_option]:text-white disabled:opacity-50"
      >
        <option value="">
          {loading ? "Loading documents..." : "— Select Document —"}
        </option>
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
