"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  getChangeRequest,
  updateChangeRequest,
  reviewChangeRequest,
  withdrawChangeRequest,
} from "@/services/ChangeRequests";
import EntityApprovals from "@/components/EntityApprovals";
import FederatedBadge from "@/components/FederatedBadge";
import ComplianceHoldBadge from "@/components/ComplianceHoldBadge";

const softBg = (token, pct = 16) =>
  `color-mix(in srgb, ${token} ${pct}%, transparent)`;

const IMPACT_TYPES = ["COST", "SCHEDULE", "BOTH", "NONE"];

const NEUTRAL_BADGE = { background: "var(--rf-bg4)", color: "var(--rf-txt2)" };

const STATUS_STYLES = {
  PENDING:   { background: softBg("var(--rf-yellow)"), color: "var(--rf-yellow)" },
  APPROVED:  { background: softBg("var(--rf-green)"),  color: "var(--rf-green)" },
  REJECTED:  { background: softBg("var(--rf-red)"),    color: "var(--rf-red)" },
  WITHDRAWN: NEUTRAL_BADGE,
};

const inputClass =
  "w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--rf-bg3)] border border-[var(--rf-border2)] text-[var(--rf-txt)] focus:border-[var(--rf-accent)] disabled:opacity-60";
const labelStyle = { color: "var(--rf-txt2)" };

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ color: "var(--rf-txt)" }}
      >
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen p-6" style={{ color: "var(--rf-txt)" }}>
      <div className="mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm mb-4 flex items-center gap-1 transition-colors text-[var(--rf-txt2)] hover:text-[var(--rf-txt)]"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">
            {isPending ? "Review Change Request" : "Change Request"}
          </h1>
          {status && (
            <span
              className="text-xs px-2 py-0.5 rounded font-mono"
              style={STATUS_STYLES[status] ?? NEUTRAL_BADGE}
            >
              {status}
            </span>
          )}
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ background: softBg("var(--rf-red)", 14), border: `1px solid ${softBg("var(--rf-red)", 40)}`, color: "var(--rf-red)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={labelStyle}>
              Title <span style={{ color: "var(--rf-red)" }}>*</span>
            </label>
            <input
              disabled={!isEditable}
              className={inputClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={labelStyle}>
              Description
            </label>
            <textarea
              disabled={!isEditable}
              className={`${inputClass} resize-none`}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={labelStyle}>
              Impact Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {IMPACT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => set("impactType", t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${form.impactType === t ? "bg-[var(--rf-accent)] text-white" : "bg-[var(--rf-bg3)] text-[var(--rf-txt2)] hover:bg-[var(--rf-bg4)] disabled:hover:bg-[var(--rf-bg3)]"}`}
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
                  <label className="block text-sm mb-1" style={labelStyle}>
                    Cost Impact ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={!isEditable}
                    className={inputClass}
                    value={form.costImpact}
                    onChange={(e) => set("costImpact", e.target.value)}
                  />
                </div>
              )}
              {showDays && (
                <div>
                  <label className="block text-sm mb-1" style={labelStyle}>
                    Schedule Impact (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!isEditable}
                    className={inputClass}
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
                className="flex-1 py-2.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50 bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)]"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-[var(--rf-bg3)] hover:bg-[var(--rf-bg4)] text-[var(--rf-txt)]"
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {id && (
          <div className="mt-6">
            <div
              className="mb-3"
              style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
            >
              <FederatedBadge entityType="ChangeRequest" entityId={id} />
              <ComplianceHoldBadge
                entityType="ChangeRequest"
                entityId={id}
                cxProjectId={projectId || undefined}
              />
            </div>
            <EntityApprovals
              entityType="ChangeRequest"
              entityId={id}
              cxProjectId={projectId || undefined}
            />
          </div>
        )}

        {isPending && (
          <div className="mt-6 rounded-xl p-4 space-y-4 bg-[var(--rf-bg2)] border border-[var(--rf-border2)]">
            <h2 className="font-semibold" style={{ color: "var(--rf-txt)" }}>Review Decision</h2>
            <div>
              <label className="block text-sm mb-1" style={labelStyle}>
                Review Notes
              </label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes…"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction("APPROVE")}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--rf-green)" }}
              >
                Approve
              </button>
              <button
                onClick={() => setConfirmAction("REJECT")}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--rf-red)" }}
              >
                Reject
              </button>
              <button
                onClick={() => setConfirmAction("WITHDRAW")}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: softBg("var(--rf-yellow)", 18), color: "var(--rf-yellow)" }}
              >
                Withdraw
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-80 bg-[var(--rf-bg2)] border border-[var(--rf-border2)]" style={{ color: "var(--rf-txt)" }}>
            <h3 className="font-semibold mb-2">
              {confirmAction === "WITHDRAW"
                ? "Withdraw"
                : confirmAction === "APPROVE"
                  ? "Approve"
                  : "Reject"}{" "}
              Change Request?
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--rf-txt2)" }}>
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
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)]"
              >
                {reviewing || withdrawing ? "Processing…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--rf-bg3)] hover:bg-[var(--rf-bg4)] text-[var(--rf-txt)]"
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
