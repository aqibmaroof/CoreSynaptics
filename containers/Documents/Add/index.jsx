"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DocumentAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    project_id: "",
    folder_path: "",
    filename: "",
    s3_key: "",
    file_size_bytes: 0,
    mime_type: "",
    uploaded_by: "",
    version: "1",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Fetch related data
  useEffect(() => {
    fetchRelatedData();
  }, []);

  const fetchRelatedData = async () => {
    try {
      // Mock data - replace with actual API calls
      setProjects([]);
      setUsers([]);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData((prev) => ({
        ...prev,
        filename: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        s3_key: `documents/${prev.project_id || "general"}/${Date.now()}_${file.name}`,
      }));

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const validateForm = () => {
    if (!formData.filename.trim()) {
      setError("Filename is required");
      return false;
    }
    if (!formData.project_id) {
      setError("Project is required");
      return false;
    }
    if (!selectedFile) {
      setError("File is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setUploading(true);

    try {
      // Mock file upload - replace with actual S3 upload
      // const formDataUpload = new FormData();
      // formDataUpload.append("file", selectedFile);
      // const uploadRes = await fetch("/api/documents/upload", {
      //   method: "POST",
      //   body: formDataUpload,
      // });
      // if (!uploadRes.ok) throw new Error("File upload failed");

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/Document/List");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase() || "";
    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "🎪",
      pptx: "🎪",
      txt: "📄",
      zip: "🗜️",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
    };
    return icons[ext] || "📁";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Upload Document</h1>
          <p className="text-gray-400">Add a new document to your project</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Document Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-200">{error}</span>
              </div>
            )}

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Upload File</h3>

              <div className="relative">
                <label className="block text-sm font-semibold text-white mb-2">
                  Select File <span className="text-red-400">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 hover:border-blue-500/50 hover:bg-gray-700/50"
                }`}>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                    accept="*"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-2">{getFileIcon(selectedFile.name)}</div>
                        <p className="text-white font-semibold">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-blue-400 mt-3">Click to change file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-white font-semibold">Drag and drop your file</p>
                        <p className="text-gray-400 text-sm">or click to select</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {filePreview && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-2">Preview</p>
                  <img src={filePreview} alt="Preview" className="max-w-sm h-auto rounded-lg border border-gray-600" />
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Project <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
                  >
                    <option value="">— Select Project —</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Version */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Version
                  </label>
                  <input
                    type="number"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Folder Path */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Folder Path
                </label>
                <input
                  type="text"
                  name="folder_path"
                  value={formData.folder_path}
                  onChange={handleChange}
                  placeholder="e.g., /Designs/Phase1"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Uploaded By */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Uploaded By
                </label>
                <select
                  name="uploaded_by"
                  value={formData.uploaded_by}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
                >
                  <option value="">— Select User —</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Additional Information</h3>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add a description for this document"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* File Info Display */}
            {selectedFile && (
              <div className="space-y-3 pt-6 border-t border-gray-700 bg-gray-750 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300">File Information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Filename:</span>
                    <p className="text-white truncate">{formData.filename}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="text-white">{formData.mime_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <p className="text-white">{(formData.file_size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-gray-400">S3 Key:</span>
                    <p className="text-white truncate">{formData.s3_key}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
