"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const PRIORITIES = ["Normal", "High", "Critical"];
const STATUSES = ["Open", "Answered", "Closed"];

export default function RFIEdit() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    rfi_number: "",
    subject: "",
    spec_section: "",
    priority: "Normal",
    question: "",
    suggested_answer: "",
    official_answer: "",
    status: "Open",
    project_id: "",
    assigned_to_company_id: "",
    submitted_by: "",
    due_date: "",
  });

  // Fetch RFI and related data
  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Mock API call - Replace with actual API
      // const rfiRes = await fetch(`/api/rfis/${params.id}`);
      // if (!rfiRes.ok) throw new Error("Failed to fetch RFI");
      // const rfi = await rfiRes.json();

      // Mock RFI data for demonstration
      const mockRFI = {
        id: params.id,
        rfi_number: "RFI-2024-001",
        subject: "Door Specification Query",
        spec_section: "Section 3.2.1",
        priority: "High",
        question: "What are the specifications for the main entrance doors?",
        suggested_answer: "36-inch wide, fire-rated, aluminum frame",
        official_answer: "",
        status: "Open",
        project_id: "",
        assigned_to_company_id: "",
        submitted_by: "",
        due_date: "",
      };

      // Fetch related data
      const [projectsRes, companiesRes, usersRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/companies"),
        fetch("/api/users"),
      ]);

      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (companiesRes.ok) setCompanies(await companiesRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());

      setFormData(mockRFI);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load RFI");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.rfi_number.trim()) {
      setError("RFI Number is required");
      return false;
    }
    if (!formData.subject.trim()) {
      setError("Subject is required");
      return false;
    }
    if (!formData.question.trim()) {
      setError("Question is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      // Mock API call - Replace with actual API
      // const response = await fetch(`/api/rfis/${params.id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) throw new Error("Failed to update RFI");

      router.push("/RFI/List");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Loading RFI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Edit RFI</h1>
          <p className="text-gray-400">Update Request for Information</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              RFI Information
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

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RFI Number */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    RFI Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="rfi_number"
                    value={formData.rfi_number}
                    onChange={handleChange}
                    placeholder="e.g., RFI-2024-001"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Priority <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="RFI subject"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Spec Section */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Specification Section
                </label>
                <input
                  type="text"
                  name="spec_section"
                  value={formData.spec_section}
                  onChange={handleChange}
                  placeholder="e.g., Section 3.2.1"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Project & Assignment */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Assignment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Project
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

                {/* Assign to Company */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Assign to Company
                  </label>
                  <select
                    name="assigned_to_company_id"
                    value={formData.assigned_to_company_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
                  >
                    <option value="">— Select Company —</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submitted By & Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Submitted By */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Submitted By
                  </label>
                  <select
                    name="submitted_by"
                    value={formData.submitted_by}
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

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Questions & Answers */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Questions & Answers</h3>

              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Question <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Enter your question"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Suggested Answer */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Suggested Answer
                </label>
                <textarea
                  name="suggested_answer"
                  value={formData.suggested_answer}
                  onChange={handleChange}
                  placeholder="Suggest an answer (optional)"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Official Answer */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Official Answer
                </label>
                <textarea
                  name="official_answer"
                  value={formData.official_answer}
                  onChange={handleChange}
                  placeholder="Official answer from architect/engineer"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="pt-6 border-t border-gray-700">
              <label className="block text-sm font-semibold text-white mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

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
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
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
