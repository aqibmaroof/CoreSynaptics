"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MEETING_SERIES = ["OAC", "CR/MOPs", "Daily Huddle"];
const STATUSES = ["Draft", "Minutes", "Closed"];

export default function MeetingAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    series_name: "",
    meeting_number: "",
    meeting_date: "",
    start_time: "",
    end_time: "",
    location: "",
    status: "Draft",
    notes: "",
    next_meeting_date: "",
    project_id: "",
    created_by: "",
  });

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

  const validateForm = () => {
    if (!formData.series_name.trim()) {
      setError("Meeting Series is required");
      return false;
    }
    if (!formData.meeting_number.toString().trim()) {
      setError("Meeting Number is required");
      return false;
    }
    if (!formData.meeting_date) {
      setError("Meeting Date is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Mock API call - replace with actual API
      router.push("/Meeting/List");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Meeting</h1>
          <p className="text-gray-400">Schedule a new project meeting</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Meeting Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-200">{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meeting Series */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Meeting Series <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="series_name"
                    value={formData.series_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
                  >
                    <option value="">— Select Series —</option>
                    {MEETING_SERIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meeting Number */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Meeting Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="meeting_number"
                    value={formData.meeting_number}
                    onChange={handleChange}
                    placeholder="e.g., 1, 2, 3"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Meeting Date */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Meeting Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="meeting_date"
                  value={formData.meeting_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Meeting room or virtual link"
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

                {/* Created By */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Created By
                  </label>
                  <select
                    name="created_by"
                    value={formData.created_by}
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
            </div>

            {/* Notes & Status */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Additional Information
              </h3>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Meeting Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any relevant notes or agenda items"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Next Meeting Date */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Next Meeting Date
                  </label>
                  <input
                    type="date"
                    name="next_meeting_date"
                    value={formData.next_meeting_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
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
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Meeting
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
