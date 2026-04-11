"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FILE_TYPES = {
  pdf: { icon: "📄", color: "text-red-400" },
  doc: { icon: "📝", color: "text-blue-400" },
  docx: { icon: "📝", color: "text-blue-400" },
  xls: { icon: "📊", color: "text-green-400" },
  xlsx: { icon: "📊", color: "text-green-400" },
  ppt: { icon: "🎪", color: "text-orange-400" },
  pptx: { icon: "🎪", color: "text-orange-400" },
  txt: { icon: "📄", color: "text-gray-400" },
  zip: { icon: "🗜️", color: "text-purple-400" },
  image: { icon: "🖼️", color: "text-pink-400" },
  default: { icon: "📁", color: "text-gray-400" },
};

export default function DocumentList() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setDocuments([]);
      setProjects([]);
      setError("");
    } catch (err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDocuments(documents.filter((d) => d.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete document");
    }
  };

  const getFileExtension = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase() || "default";
    return FILE_TYPES[ext] || FILE_TYPES.default;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.folder_path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProject = !filterProject || doc.project_id === filterProject;

    return matchesSearch && matchesProject;
  });

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Documents</h1>
            <p className="text-gray-400">Manage project documents and files</p>
          </div>
          <Link
            href="/Document/Add"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Document
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Search & Filter
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="Filename, folder, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterProject("");
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-400">Loading documents...</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg">No documents found</p>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
              const fileType = getFileExtension(doc.filename);
              return (
                <div
                  key={doc.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg group"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-3xl ${fileType.color}`}>{fileType.icon}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/Document/Edit/${doc.id}`)}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-sm truncate">{doc.filename}</h3>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    {doc.folder_path && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-400 mt-0.5">📂 Path:</span>
                        <span className="text-sm text-gray-300 truncate">{doc.folder_path}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400">📦 Size:</span>
                      <span className="text-sm text-gray-300">{formatFileSize(doc.file_size_bytes)}</span>
                    </div>

                    {doc.version && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400">📌 Version:</span>
                        <span className="text-sm text-gray-300">{doc.version}</span>
                      </div>
                    )}

                    {doc.description && (
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400 line-clamp-2">{doc.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 border-t border-gray-700 bg-gray-750 text-xs text-gray-500 flex justify-between">
                    <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "—"}</span>
                    <span className="text-gray-400">{doc.mime_type || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm mx-4 shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Delete Document?</h3>
                <p className="text-gray-400 mb-6">Are you sure? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
