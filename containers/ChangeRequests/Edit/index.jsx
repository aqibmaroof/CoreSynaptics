"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  getChangeRequest,
  updateChangeRequest,
  reviewChangeRequest,
  withdrawChangeRequest,
} from "@/services/ChangeRequests";

const IMPACT_TYPES = ["COST", "SCHEDULE", "BOTH", "NONE"];

const STATUS_STYLES = {
  PENDING: "bg-yellow-900/40 text-yellow-300",
  APPROVED: "bg-green-900/40 text-green-400",
  REJECTED: "bg-red-900/40 text-red-300",
  WITHDRAWN: "bg-gray-700 text-gray-400",
};

export default function ChangeRequestEdit() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";

  const [form, setForm] = useState({
    title: "",
    description: "",
    impactType: "NONE",
    costImpact: "",
    scheduleDays: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (!id || !projectId) return;
    getChangeRequest(projectId, id)
      .then((res) => {
        const d = res?.data ?? res;
        setStatus(d.status ?? "");
        setForm({
          title: d.title ?? "",
          description: d.description ?? "",
          impactType: d.impactType ?? "NONE",
          costImpact: d.costImpact != null ? String(d.costImpact) : "",
          scheduleDays: d.scheduleDays != null ? String(d.scheduleDays) : "",
        });
      })
      .catch(() => setError("Failed to load change request."))
      .finally(() => setLoading(false));
  }, [id, projectId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateChangeRequest(projectId, id, {
        title: form.title.trim(),
        description: form.description || undefined,
        impactType: form.impactType,
        costImpact:
          form.costImpact !== "" ? parseFloat(form.costImpact) : undefined,
        scheduleDays:
          form.scheduleDays !== "" ? parseInt(form.scheduleDays) : undefined,
      });
      router.push("/ChangeRequests");
    } catch (err) {
      setError(err?.message || "Failed to update change request.");
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (decision) => {
    setReviewing(true);
    setError("");
    try {
      await reviewChangeRequest(projectId, id, {
        decision,
        reviewNotes: reviewNotes || undefined,
      });
      setStatus(decision === "APPROVE" ? "APPROVED" : "REJECTED");
      setConfirmAction(null);
    } catch (err) {
      setError(err?.message || "Review failed.");
    } finally {
      setReviewing(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setError("");
    try {
      await withdrawChangeRequest(projectId, id);
      setStatus("WITHDRAWN");
      setConfirmAction(null);
    } catch (err) {
      setError(err?.message || "Withdraw failed.");
    } finally {
      setWithdrawing(false);
    }
  };

  const showCost = form.impactType === "COST" || form.impactType === "BOTH";
  const showDays = form.impactType === "SCHEDULE" || form.impactType === "BOTH";
  const isPending = status === "PENDING";
  const isEditable = isPending;

  if (loading)
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">
            {isPending ? "Review Change Request" : "Change Request"}
          </h1>
          {status && (
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono ${STATUS_STYLES[status] ?? "bg-gray-700 text-gray-400"}`}
            >
              {status}
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              disabled={!isEditable}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Description
            </label>
            <textarea
              disabled={!isEditable}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none disabled:opacity-60"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Impact Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {IMPACT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => set("impactType", t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${form.impactType === t ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {(showCost || showDays) && (
            <div className="grid grid-cols-2 gap-4">
              {showCost && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Cost Impact ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={!isEditable}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
                    value={form.costImpact}
                    onChange={(e) => set("costImpact", e.target.value)}
                  />
                </div>
              )}
              {showDays && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Schedule Impact (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!isEditable}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
                    value={form.scheduleDays}
                    onChange={(e) => set("scheduleDays", e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {isEditable && (
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {isPending && (
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
            <h2 className="font-semibold text-gray-200">Review Decision</h2>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Review Notes
              </label>
              <textarea
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes…"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction("APPROVE")}
                className="flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => setConfirmAction("REJECT")}
                className="flex-1 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => setConfirmAction("WITHDRAW")}
                className="px-4 py-2 bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300 rounded-lg text-sm font-medium transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-2">
              {confirmAction === "WITHDRAW"
                ? "Withdraw"
                : confirmAction === "APPROVE"
                  ? "Approve"
                  : "Reject"}{" "}
              Change Request?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  confirmAction === "WITHDRAW"
                    ? handleWithdraw()
                    : handleReview(confirmAction)
                }
                disabled={reviewing || withdrawing}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {reviewing || withdrawing ? "Processing…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
