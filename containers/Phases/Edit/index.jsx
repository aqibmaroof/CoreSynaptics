"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPhaseById, updatePhase } from "@/services/Phases";

export default function PhaseEdit() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    order: "0",
  });

  useEffect(() => {
    if (!id) return;
    getPhaseById(id)
      .then((phase) => {
        setForm({
          name: phase.name ?? "",
          startDate: phase.startDate ? phase.startDate.slice(0, 10) : "",
          endDate: phase.endDate ? phase.endDate.slice(0, 10) : "",
          order: String(phase.order ?? 0),
        });
      })
      .catch((err) => setError(err?.message || "Failed to load phase"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "startDate" || name === "endDate") setDateError("");
  };

  const validateDates = () => {
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      setDateError("End date must be after start date.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDates()) return;

    setLoading(true);
    setError("");
    try {
      const payload = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.startDate) payload.startDate = new Date(form.startDate).toISOString();
      if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();
      payload.order = parseInt(form.order, 10) || 0;

      await updatePhase(id, payload);
      router.push("/Phases/List");
    } catch (err) {
      setError(err?.message || "Failed to update phase");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <svg className="w-10 h-10 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Phase</h1>
            <p className="text-gray-400 text-sm mt-1">projectId cannot be changed — use Clone to move to another project.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phase Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Phase name"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${dateError ? "border-red-500" : "border-gray-600"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${dateError ? "border-red-500" : "border-gray-600"}`}
              />
            </div>
          </div>
          {dateError && <p className="text-red-400 text-sm -mt-4">{dateError}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
            <input
              name="order"
              type="number"
              min="0"
              value={form.order}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-gray-500 text-xs mt-1">Must be unique within a project. Use 9999 as a temporary value when reordering.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white rounded-lg transition-all flex items-center gap-2"
            >
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
