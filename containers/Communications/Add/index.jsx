"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCommunication } from "@/services/Communications";

const TYPES = [
  { value: "FORMAL_LETTER", label: "Formal Letter" },
  { value: "RFI", label: "RFI" },
  { value: "TRANSMITTAL", label: "Transmittal" },
  { value: "SUBMITTAL", label: "Submittal" },
  { value: "CHANGE_ORDER", label: "Change Order" },
  { value: "MEETING_MINUTES", label: "Meeting Minutes" },
];

const EMPTY = {
  commType: "RFI",
  commNumber: "",
  subject: "",
  body: "",
  fromCompanyCode: "",
  toCompanyCode: "",
  audienceLabel: "",
};

const inputCls =
  "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function CommunicationsAdd() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.commNumber.trim()) {
      setError("Communication number is required.");
      return;
    }
    if (!form.subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!form.body.trim()) {
      setError("Body is required.");
      return;
    }
    if (!form.fromCompanyCode.trim()) {
      setError("From company code is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createCommunication({
        commType: form.commType,
        commNumber: form.commNumber.trim(),
        subject: form.subject.trim(),
        body: form.body.trim(),
        fromCompanyCode: form.fromCompanyCode.trim(),
        toCompanyCode: form.toCompanyCode.trim() || undefined,
        audienceLabel: form.audienceLabel.trim() || undefined,
      });
      router.push("/Communications");
    } catch (err) {
      setError(err?.message || "Failed to create communication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-6">New Communication</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Type <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("commType", t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.commType === t.value ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Comm Number <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls}
                value={form.commNumber}
                onChange={(e) => set("commNumber", e.target.value)}
                placeholder="RFI-001"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                From Company Code <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls}
                value={form.fromCompanyCode}
                onChange={(e) => set("fromCompanyCode", e.target.value)}
                placeholder="ABC-CON"
                maxLength={50}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              To Company Code
            </label>
            <input
              className={inputCls}
              value={form.toCompanyCode}
              onChange={(e) => set("toCompanyCode", e.target.value)}
              placeholder="XYZ-GEN"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls}
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Clarification on foundation specifications"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Body <span className="text-red-400">*</span>
            </label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={6}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder="Communication content…"
              maxLength={10000}
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {form.body.length}/10,000
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Audience Label
            </label>
            <input
              className={inputCls}
              value={form.audienceLabel}
              onChange={(e) => set("audienceLabel", e.target.value)}
              placeholder="General Contractor and Subcontractors"
              maxLength={200}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating…" : "Create Communication"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
