"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLeadById } from "@/services/Leads";
import { getCompanyById } from "@/services/Companies";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

const STATUS_BADGE = {
  IN_DISCUSSION: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  CONVERTED: "bg-green-500/20 text-green-300 border-green-500/30",
};

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-800/60 last:border-0">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-200 text-right">{value ?? "—"}</span>
    </div>
  );
}

export default function LeadDetail() {
  const router = useRouter();
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getLeadById(id)
      .then(async (res) => {
        const data = res?.data ?? res;
        setLead(data);
        if (data?.companyId) {
          try {
            const c = await getCompanyById(data.companyId);
            setCompany(c?.data ?? c);
          } catch {}
        }
      })
      .catch((err) => setError(err?.message || "Failed to load lead"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Lead not found"}</p>
          <button
            onClick={() => router.back()}
            className="text-cyan-400 hover:text-cyan-300 text-sm underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const statusKey = lead.status || "IN_DISCUSSION";
  const statusLabel = statusKey === "CONVERTED" ? "Converted" : "In Discussion";

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Leads
        </button>
      </div>

      {/* Header card */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {(lead.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {lead.source || "No source"}{company ? ` · ${company.name}` : ""}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_BADGE[statusKey] || STATUS_BADGE.IN_DISCUSSION}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Lead Details
          </h2>
          <DetailRow label="Name" value={lead.name} />
          <DetailRow label="Email" value={lead.email} />
          <DetailRow label="Phone" value={lead.phone} />
          <DetailRow label="Source" value={lead.source} />
          <DetailRow label="Status" value={statusLabel} />
          <DetailRow label="Company" value={company?.name} />
          {lead.notes && <DetailRow label="Notes" value={lead.notes} />}
          <DetailRow
            label="Created"
            value={lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : undefined}
          />
          <DetailRow
            label="Last Updated"
            value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : undefined}
          />
          <div className="mt-4 pt-4 border-t border-gray-800/60">
            <p className="text-xs text-gray-500 mb-1">Lead ID</p>
            <p className="text-xs font-mono text-gray-400 break-all">{id}</p>
          </div>
        </div>

        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
          <ActivityTimeline entityType="lead" entityId={id} />
        </div>
      </div>
    </div>
  );
}
